define(
    [
        '../../../../../common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/app-deploy/application-deploy/sub-pages/validate-ip/ip-setting-popup',
        'text!views/app-deploy/application-deploy/sub-pages/validate-ip/_validate-ip-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        IpSettingPopup,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .del-ip-btn': 'deleteIp',
                'click .edit-ip-btn': 'showEditIpPopup'
            },

            validIp: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(this.tpl());

                // Set SubViews
                that.subViews['ipSettingPopup'] = new IpSettingPopup();
                that.subViews['ipSettingPopup'].on('edit-ip', function() {
                    // IP 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.validateIpGrid.getSelectedRowIdx();

                    that.validateIpGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadIp({validIp: that.validIp});
                        }else{
                            that.validateIpGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['ipSettingPopup'].on('add-ip', function() {
                    // IP 생성시, 리스트 리프래시
                    that.validateIpGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.validateIpGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ValidateIPService', 'getValidateIPList', 'ValidateIPSearchConditionOMM'),
                        key: 'ValidateIPSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'ValidateIPListOMM',
                        key: 'validateIPList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['ipSettingPopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function() {
                                    that.loadIpList();
                                }
                            }
                        ]
                    },
                    gridToggle: false,
                    paging: true,

                    fields: ['validIp', 'validIpDesc', 'modifyUserId', 'modifyOccurDttm'],
                    columns: [
                        {text: bxMsg('app-deploy.ip'), flex: 3, dataIndex: 'validIp', align: 'center'},
                        {text: bxMsg('app-deploy.description'), flex: 5, dataIndex: 'validIpDesc', align: 'center'},
                        {text: bxMsg('app-deploy.input-id'), flex: 3, dataIndex: 'modifyUserId', align: 'center'},
                        {text: bxMsg('app-deploy.input-date'), flex: 3, dataIndex: 'modifyOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-ip-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('validIp')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.loadIp({validIp: record.get('validIp')});
                        }
                    }
                });

                // Dom Element Cache
                that.$validateIpGrid = that.$el.find('.validate-ip-grid');
                that.$validateIpDetail = that.$el.find('.validate-ip-detail');
            },

            render: function() {
                var that = this;

                that.$validateIpGrid.html(that.validateIpGrid.render(function(){that.loadIpList();}));
                that.$validateIpDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            loadIpList: function () {
            	var that = this;
            	
                this.validateIpGrid.loadData(null, function(data) {
                	data = data['validateIPList'];
                	if(data && data.length) {
                		that.$validateIpGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteIp: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ValidateIPService', 'removeValidateIP', 'ValidateIPOMM',
                            {
                                validIp: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.validateIpGrid.reloadData();

                                    // 상세 초기화
                                    that.$validateIpDetail.find('input[data-form-param]').val('');
                                } else if (code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditIpPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$validateIpDetail);

                if(!renderData.validIp) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['ipSettingPopup'].render(renderData);
            },

            /**
             * authId
             * */
            loadIp: function(param) {
                var that = this,
                    requestParam;

                that.validIp = param.validIp;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ValidateIPService', 'getValidateIP', 'ValidateIPOMM',
                    {
                        validIp: param.validIp
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        commonUtil.makeFormFromParam(that.$validateIpDetail, response.ValidateIPOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);