define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/trx-setting/test-parameter/test-parameter-popup',
        'text!views/trx-setting/test-parameter/_test-parameter-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        TestParamPopup,
        tpl
    ) {

        var TestParameterView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            testKeyTypeCd: null,
            testKeyId: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadTestParamList',
                'enter-component .test-param-search input': 'loadTestParamList',
                'change .test-param-search select': 'loadTestParamList',

                'click .del-test-param-btn': 'deleteTestParam',
                'click .edit-test-param-btn': 'showEditTestParamPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['testParamPopup'] = new TestParamPopup();
                that.subViews['testParamPopup'].on('edit-test-param', function() {
                    // 테스트 파람 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.testParamGrid.getSelectedRowIdx();

                    that.testParamGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadTestParam({testKeyTypeCd: that.testKeyTypeCd, testKeyId: that.testKeyId});
                        }else{
                            that.testParamGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['testParamPopup'].on('add-test-param', function() {
                    // 테스트 파람 생성시, 리스트 리프래시
                    that.testParamGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.testParamGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('TestParamService', 'getTestParamList', 'TestParamSearchConditionOMM'),
                        key: 'TestParamSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'TestParamListOMM',
                        key: 'testParamList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['testParamPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['testKeyTypeCd', 'testKeyId', 'testDt', 'testEaiId'],
                    columns: [
                        {
                            text: bxMsg('trx-setting.test-level'), flex: 1, dataIndex: 'testKeyTypeCd', align: 'center',
                            renderer: function(value) {
                                return commonConfig.comCdList['BXMRT0008'][value];
                            }
                        },
                        {text: bxMsg('trx-setting.test-key-id'), flex: 1, dataIndex: 'testKeyId', align: 'center'},
                        {
                            text: bxMsg('trx-setting.test-eai-id'), flex: 1, dataIndex: 'testEaiId', align: 'center',
                            renderer: function(value) {
                                return commonConfig.comCdList['BXMAD0026'][value];
                            }
                        },
                        {text: bxMsg('trx-setting.test-date'), width: 160, dataIndex: 'testDt', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-test-param-btn" data-key-cd="{0}" data-key-id="{1}" data-date="{2}" data-eai-id="{3}"> ' +
                                        '<i class="bw-icon i-20 i-func-trash"></i>' +
                                    '</button>',
                                    record.get('testKeyTypeCd'),
                                    record.get('testKeyId'),
                                    record.get('testDt'),
                                    record.get('testEaiId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadTestParam({testKeyTypeCd: record.get('testKeyTypeCd'), testKeyId: record.get('testKeyId')});
                        }
                    }
                });

                // Dom Element Cache
                that.$testParamSearch = that.$el.find('.test-param-search');
                that.$testParamGrid = that.$el.find('.test-param-grid');
                that.$testParamDetail = that.$el.find('.test-param-detail');
                that.$testParamDetailTitle = that.$el.find('h3 > .test-param-detail-title');
            },

            render: function() {
                var that = this;

                that.$testParamGrid.html(that.testParamGrid.render(function(){that.loadTestParamList();}));
                that.$testParamDetail.append(that.subViews['detailLoadingBar'].render());
                that.$testParamSearch.find('[data-form-param="testKeyTypeCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0008'], true));

                return that.$el;
            },

            resetSearch: function() {
                this.$testParamSearch.find('[data-form-param]').val('');
            },

            loadTestParamList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$testParamSearch);
                this.testParamGrid.loadData(params, function(data) {
                	data = data['testParamList'];
                	if(data && data.length) {
                		that.$testParamGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteTestParam: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'TestParamService', 'removeTestParam', 'TestParamOMM',
                            {
                                testKeyTypeCd: $target.attr('data-key-cd'),
                                testKeyId: $target.attr('data-key-id'),
                                testDt: $target.attr('data-date'),
                                testEaiId: $target.attr('data-eai-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.testParamGrid.reloadData();

                                    // 상세 초기화
                                    that.$testParamDetailTitle.text('');
                                    that.$testParamDetail.find('input[data-form-param]').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditTestParamPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$testParamDetail);

                if(!renderData.testKeyId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['testParamPopup'].render(renderData);
            },

            /**
             * testKeyTypeCd
             * testKeyId
             * */
            loadTestParam: function(param) {
                var that = this,
                    requestParam;

                that.testKeyTypeCd = param.testKeyTypeCd;
                that.testKeyId = param.testKeyId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'TestParamService', 'getTestParamInfo', 'TestParamOMM',
                    {
                        testKeyTypeCd: param.testKeyTypeCd,
                        testKeyId: param.testKeyId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var testParamOMM = response.TestParamOMM;

                        that.$testParamDetailTitle.text(testParamOMM.testKeyId);
                        commonUtil.makeFormFromParam(that.$testParamDetail, testParamOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return TestParameterView;
    }
);