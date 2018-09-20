define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/center-cut/center-cut-server-management/center-cut-server-management-popup',
        'text!views/center-cut/center-cut-server-management/_center-cut-server-management-tpl.html'
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
                'click .del-btn': 'deleteItem',
                'click .edit-btn': 'showEditItemPopup'
            },

            nodeNum: null,
            svrType: null,

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
                                nodeNum: that.nodeNum,
                                svrType: that.svrType
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
                        obj: commonUtil.getBxmReqData('SCC1008', 'selectCcNodeList', 'SCC100802In', null, 'bxmAdminCC'),
                        key: 'SCC100802In'
                    },
                    responseParam: {
                        objKey: 'SCC100802ListOut',
                        key: 'svrList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-refresh" title="' + bxMsg('common.refresh') + '"></i></button>',
                                event: function() {
                                    that.loadList();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['subPopup'].render();
                                }
                            }
                        ]
                    },

                    fields: ['nodeNum', 'svrIp', 'svrPort', 'requestUri', 'svrNm', 'svrType', 'useYn', 'status', 'autoSvrYn'],
                    columns: [
                        {
	                   	  text: bxMsg('centerCut.serverType'), flex: 2, dataIndex: 'svrType', align: 'center',
	                	  renderer: function (value) {
	                		  return commonConfig.comCdList['BXMCC0017'][value];
	                	  }
                   	    },
                        {text: bxMsg('centerCut.nodeNo'), flex: 1, dataIndex: 'nodeNum', align: 'center'},
                        {text: bxMsg('centerCut.serverIp'), flex: 2, dataIndex: 'svrIp', align: 'center'},
                        {text: bxMsg('centerCut.serverPort'), flex: 1, dataIndex: 'svrPort', align: 'center'},
                        {text: bxMsg('centerCut.requestAddress'), flex: 3, dataIndex: 'requestUri', align: 'center'},
                        {text: bxMsg('centerCut.serverName'), flex: 2, dataIndex: 'svrNm', align: 'center'},
                        {text: bxMsg('centerCut.useYn'), flex: 1, dataIndex: 'useYn', align: 'center'},
                        {text: bxMsg('centerCut.autoSvrYn'), flex: 1, dataIndex: 'autoSvrYn', align: 'center'},
                        {
                            text: bxMsg('centerCut.serverStatus'), flex: 1, dataIndex: 'status', align: 'center',
                            tdCls: "fa-20",
                            renderer: function (value) {
                                return value ? '<i class="fa fa-check-circle chr-c-green"></i>'
                                    : '<i class="fa fa-exclamation-circle chr-c-orange"></i>';
                            }
                        },
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-btn" data-id="{0}" data-type="{1}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('nodeNum'), record.get('svrType')
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
                            this.gridSelect = (cellIndex !== 9);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select : function(_this, record) {
                            that.loadDetail({
                                nodeNum: record.get('nodeNum'),
                                svrType: record.get('svrType')
                            });
                        }
                    }
                });

                // Dom Element Cache
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

            loadList: function() {
            	var that= this;
            	
                this.grid.loadData({}, function (data) {
                	data = data['svrList'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            /**
             * nodeNum
             * svrType
             * */
            loadDetail: function(param) {
                var that = this,
                    requestParam;

                that.nodeNum = param.nodeNum;
                that.svrType = param.svrType;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SCC1008', 'selectCcNode', 'SCC100802In',
                    {
                        nodeNum: param.nodeNum,
                        svrType: param.svrType
                    },
                    'bxmAdminCC'
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['SCC100802Out'];

                        that.$detailTitle.text(data.nodeNum);
                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
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
                            'SCC1008', 'deleteCcNode', 'SCC100802In',
                            {
                                nodeNum: $target.attr('data-id'),
                                svrType: $target.attr('data-type')
                            },
                            'bxmAdminCC'
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

                if(!renderData.nodeNum) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['subPopup'].render(renderData);
            }
        });
    }
);