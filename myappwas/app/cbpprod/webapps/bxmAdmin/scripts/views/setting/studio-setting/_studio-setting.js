define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/studio-setting/studio-setting-popup',
        'text!views/setting/studio-setting/_studio-setting-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        StudioSettingPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadStudioSettingList',
                'enter-component .studio-setting-search input': 'loadStudioSettingList',
                'change .studio-setting-search select': 'loadStudioSettingList',

                'click .del-studio-btn': 'deleteStudioSetting',
                'click .edit-studio-btn': 'showEditStudioSettingPopup'
            },

            namespace: null,
            property: null,
            value: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['studioSettingPopup'] = new StudioSettingPopup();
                that.subViews['studioSettingPopup'].on('edit-studio', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.studioSettingGrid.getSelectedRowIdx();

                    that.studioSettingGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadStudioSetting({
                                namespace: that.namespace,
                                property: that.property,
                                value: that.value
                            });
                        }else{
                            that.studioSettingGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['studioSettingPopup'].on('add-studio', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.studioSettingGrid.reloadData();
                });
                that.subViews['studioSettingPopup'].on('add-namespace', function() {
                    that.updateNamespaceList();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.studioSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BuilderConfigService', 'getBuilderConfigList', 'BuilderConfigSearchConditionOMM'),
                        key: 'BuilderConfigSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BuilderConfigListOMM',
                        key: 'builderConfigList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['studioSettingPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['property', 'value', 'description', 'useYn', 'namespace'],
                    columns: [
                        {text: bxMsg('setting.attr'), flex: 5, dataIndex: 'property', style: 'text-align: center', tdCls: 'left-align'},
                        {text: bxMsg('setting.value'), flex: 5, dataIndex: 'value', style: 'text-align: center', tdCls: 'left-align'},
                        {text: bxMsg('setting.description'), flex: 10, dataIndex: 'description', style: 'text-align: center', tdCls: 'left-align'},
                        {text: bxMsg('setting.use-yn'), flex: 2, dataIndex: 'useYn', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-studio-btn" data-namespace="{0}" data-property="{1}" data-value="{2}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('namespace'),
                                    record.get('property'),
                                    record.get('value')
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
                            that.loadStudioSetting({
                                namespace: record.get('namespace'),
                                property: record.get('property'),
                                value: record.get('value')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$studioSettingSearch = that.$el.find('.studio-setting-search');
                that.$studioSettingGrid = that.$el.find('.studio-setting-grid');
                that.$studioSettingDetail = that.$el.find('.studio-setting-detail');
            },

            render: function() {
                var that = this;

                that.$studioSettingGrid.html(that.studioSettingGrid.render(function(){that.loadStudioSettingList();}));
                that.$studioSettingDetail.append(that.subViews['detailLoadingBar'].render());
                
                that.updateNamespaceList();

                return that.$el;
            },

            // Search form NS코드 fill in
            updateNamespaceList: function () {
                var that = this;
                // 요청 객체 생성
                var requestParam = commonUtil.getBxmReqData('BuilderConfigService', 'getNamespaceList', 'EmptyOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var nsList = response.BuilderConfigNSListOMM.namespaceList,
                            $optionList = ['<option value="" selected>' + bxMsg('setting.division-selection') + '</option>'];

                        // option 태그 렌더
                        nsList.forEach(function(nsCode) {
                            var option =
                                '<option value="' + nsCode.name + '">' +
                                nsCode.name + ' [' + nsCode.description + ']</option>';

                            $optionList.push(option);
                        });

                        that.$studioSettingSearch.find('select[data-form-param="namespace"]').html($optionList);
                    }
                });
            },

            resetSearch: function() {
            	this.$studioSettingSearch.find('select[data-form-param]').val('');
            	this.$studioSettingSearch.find('input[data-form-param]').val('');
            },

            loadStudioSettingList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$studioSettingSearch);
                this.studioSettingGrid.loadData(params, function(data) {
                	data = data['builderConfigList'];
                	if(data && data.length) {
                		that.$studioSettingGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteStudioSetting: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        swal({
                                title: '', text:  bxMsg('common.password-msg'), type: "input", inputType: 'password',
                                showCancelButton: true, closeOnConfirm: false, inputPlaceholder: bxMsg('setting.pwd')
                            },
                            function(inputValue){
                                if (inputValue === false) return false;

                                if (inputValue.trim() === "") {
                                    swal.showInputError(bxMsg('common.password-msg'));
                                    return false;
                                }

                                // 요청 객체 생성
                                requestParam = commonUtil.getBxmReqData(
                                    'BuilderConfigService', 'removeBuilderConfig', 'BuilderConfigPwdOMM',
                                    {
                                        namespace: $target.attr('data-namespace'),
                                        property: $target.attr('data-property'),
                                        value: $target.attr('data-value'),
                                        password: inputValue
                                    }
                                );

                                // Ajax 요청
                                commonUtil.requestBxmAjax(requestParam, {
                                    success: function(response) {
                                        var code = response.ResponseCode.code;

                                        if(code === 200){
                                            swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                            // 그리드 리로드
                                            that.studioSettingGrid.reloadData();

                                            // 상세 초기화
                                            that.$studioSettingDetail.find('input[data-form-param]').val('');
                                        }else if(code === 205) {
                                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        }
                                    }
                                });
                            });
                    }
                );
            },

            showEditStudioSettingPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$studioSettingDetail);

                if(!renderData.value) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['studioSettingPopup'].render(renderData);
            },

            /**
             * namespace, property, value
             * */
            loadStudioSetting: function(param) {
                var that = this,
                    requestParam;

                that.namespace = param.namespace;
                that.property = param.property;
                that.value = param.value;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BuilderConfigService', 'getBuilderConfigInfo', 'BuilderConfigOMM',
                    {
                        namespace: param.namespace,
                        property: param.property,
                        value: param.value
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var formData = response.BuilderConfigOMM;
                        formData.ns_description = formData.namespace + " [" + formData.namespaceDesc + "]";
                        commonUtil.makeFormFromParam(that.$studioSettingDetail, formData);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);