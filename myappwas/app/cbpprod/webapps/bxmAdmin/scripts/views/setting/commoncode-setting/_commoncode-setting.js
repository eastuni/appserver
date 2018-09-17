define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/commoncode-setting/commoncode-setting-popup',
        'text!views/setting/commoncode-setting/_commoncode-setting-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        CommonCodeSettingPopup,
        tpl
    ) {

        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadCommonCodeList',
                'enter-component .commoncode-setting-search input': 'loadCommonCodeList',
                'change .commoncode-setting-search select': 'loadCommonCodeList',
                
                'click .del-commoncode-btn': 'deleteCommonCode',
                'click .edit-commoncode-btn': 'showEditCommonCodePopup'
            },

            cdId: null,
            cdVal: null,
            langCd: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['commonCodeSettingPopup'] = new CommonCodeSettingPopup();
                that.subViews['commonCodeSettingPopup'].on('edit-commoncode', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.commonCodeSettingGrid.getSelectedRowIdx();

                    that.commonCodeSettingGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadCommonCode({
                                cdId: that.cdId,
                                cdVal: that.cdVal,
                                langCd: that.langCd
                            });
                        }else{
                            that.commonCodeSettingGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['commonCodeSettingPopup'].on('add-commoncode', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.commonCodeSettingGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.commonCodeSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('CommonCodeService', 'getCommonCodeList', 'CommonCodeSCOMM'),
                        key: 'CommonCodeSCOMM'
                    },
                    responseParam: {
                        objKey: 'CommonCodeListOMM',
                        key: 'commonCodeList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['commonCodeSettingPopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData('CommonCodeService', 'commonCodeExportExcel', 'EmptyOMM');

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['cdId', 'cdNm', 'cdVal', 'cdValNm', 'langCd', 'useYn', 'seq', 'regUserId', 'regOccurDttm'],
                    columns: [
                        {text: bxMsg('setting.code-id'), flex: 2, dataIndex: 'cdId', align: 'center'},
                        {text: bxMsg('setting.code-nm'), flex: 4, dataIndex: 'cdNm', align: 'center'},
                        {text: bxMsg('setting.code-val'), flex: 1, dataIndex: 'cdVal', align: 'center', cls: bxMsg.locale === 'en' && 'bx-grid-header-wrap'},
                        {text: bxMsg('setting.code-val-nm'), flex: 2, dataIndex: 'cdValNm', align: 'center'},
                        {
                            text: bxMsg('setting.language-code'),
                            flex: 2,
                            dataIndex: 'langCd',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0003'][value];
                            },
                            align: 'center'},
                        {text: bxMsg('setting.use-yn'), flex: 1, dataIndex: 'useYn', align: 'center'},
                        {text: bxMsg('setting.serial-num'), flex: 1, dataIndex: 'seq', align: 'center', cls: bxMsg.locale === 'en' && 'bx-grid-header-wrap'},
                        {text: bxMsg('setting.register-id'), flex: 2, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('setting.register-date'), flex: 3, dataIndex: 'regOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-commoncode-btn" data-id="{0}" data-val="{1}" data-lang="{2}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('cdId'),
                                    record.get('cdVal'),
                                    record.get('langCd')
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
                            that.loadCommonCode({
                                cdId: record.get('cdId'),
                                cdVal: record.get('cdVal'),
                                langCd: record.get('langCd')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$commonCodeSettingSearch = that.$el.find('.commoncode-setting-search');
                that.$commonCodeSettingGrid = that.$el.find('.commoncode-setting-grid');
                that.$commonCodeSettingDetail = that.$el.find('.commoncode-setting-detail');
                that.$commonCodeSettingDetailTitle = that.$el.find('h3 > .commoncode-setting-detail-title');
            },

            render: function() {
                var that = this;

                that.$commonCodeSettingGrid.html(that.commonCodeSettingGrid.render(function(){that.loadCommonCodeList();}));
                that.$commonCodeSettingDetail.append(that.subViews['detailLoadingBar'].render());
                that.$commonCodeSettingSearch.find('select[data-form-param="langCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0003'], true, bxMsg('common.all')));
                that.$commonCodeSettingSearch.find('select[data-form-param="langCd"]').val(commonConfig.locale);
                
                that.updateNamespaceList();
                
                return that.$el;
            },

            updateNamespaceList: function () {
                var that = this;
                // 요청 객체 생성
                var requestParam = commonUtil.getBxmReqData('CommonCodeService', 'getTopCodeList', 'EmptyOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var commonCodeList = response.CommonCodeListOMM.commonCodeList,
                            $optionList = ['<option value="" selected>' + bxMsg('setting.division-code-selection') + '</option>'];

                        // option 태그 렌더
                        commonCodeList.forEach(function(commonCode) {
                            var option =
                                '<option value="' + commonCode.cdId + '" data-name="'+ commonCode.cdId +'">[' +
                                commonCode.cdId + "]" + commonCode.cdNm +
                                '</option>';

                            $optionList.push(option);
                        });
                        
                        that.$commonCodeSettingSearch.find('select[data-form-param="cdId"]').html($optionList);
                    }
                });
            },
            
            resetSearch: function() {
                this.$commonCodeSettingSearch.find('[data-form-param]').val('');
            },

            loadCommonCodeList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$commonCodeSettingSearch);
            	
                this.commonCodeSettingGrid.loadData(params, function (data) {
                	data = data['commonCodeList'];
                	if(data && data.length) {
                		that.$commonCodeSettingGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteCommonCode: function(e) {
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
                                    'CommonCodeService', 'removeCommonCode', 'CommonCodePwdOMM',
                                    {
                                        cdId: $target.attr('data-id'),
                                        cdVal: $target.attr('data-val'),
                                        langCd: $target.attr('data-lang'),
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
                                            that.commonCodeSettingGrid.reloadData();

                                            // 상세 초기화
                                            that.$commonCodeSettingDetailTitle.text('');
                                            that.$commonCodeSettingDetail.find('input[data-form-param]').val('');
                                        }else if(code === 205) {
                                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        }
                                    }
                                });
                            });
                    }
                );
            },

            showEditCommonCodePopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$commonCodeSettingDetail);

                if(!renderData.cdId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['commonCodeSettingPopup'].render(renderData);
            },

            /**
             * cdId
             * */
            loadCommonCode: function(param) {
                var that = this,
                    requestParam;

                that.cdId = param.cdId;
                that.cdVal = param.cdVal;
                that.langCd = param.langCd;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'CommonCodeService', 'getCommonCodeInfo', 'CommonCodeOMM',
                    {
                        cdId: param.cdId,
                        cdVal: param.cdVal,
                        langCd: param.langCd
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var commonCodeOMM = response.CommonCodeOMM;

                        that.$commonCodeSettingDetailTitle.text(commonCodeOMM.cdNm + " : " + commonCodeOMM.cdVal);
                        commonUtil.makeFormFromParam(that.$commonCodeSettingDetail, commonCodeOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);