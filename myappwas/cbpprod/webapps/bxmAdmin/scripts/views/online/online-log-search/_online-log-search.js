define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/online/online-log-search/popup/trx-code-select-popup',
        'views/online/online-log-search/popup/svc-log-detail-popup',
        'views/online/online-log-search/popup/img-log-detail-popup',
        'views/online/online-log-search/popup/trx-log-detail-popup',
        'views/online/online-log-search/popup/err-log-detail-popup',
        'text!views/online/online-log-search/component/search-form-biz.html',
        'text!views/online/online-log-search/component/search-form-biz-no-trxCd.html',
        'text!views/online/online-log-search/component/search-form.html',
        'text!views/online/online-log-search/component/search-form-no-trxCd.html',
        'text!views/online/online-log-search/_online-log-search-tpl.html'
    ],
    function (commonUtil,
              commonConfig,
              ExtGrid,
              LoadingBar,
              TrxCodeSelectPopup,
              SvcLogDetailPopup,
              ImgLogDetailPopup,
              TrxLogDetailPopup,
              ErrLogDetailPopup,
              searchFormBiz,
              searchFormBizNoTrxCd,
              searchForm,
              searchFormNoTrxCd,
              tpl
              ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl,
                'searchFormBiz': commonConfig.useTrxCd ? searchFormBiz : searchFormBizNoTrxCd,
                'searchForm': commonConfig.useTrxCd ? searchForm : searchFormNoTrxCd
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadOnlineLogList',
                'click .trx-code-search-btn': 'showTrxCodeSelectPopup',
                'enter-component .online-log-search input': 'loadOnlineLogList',

                'change .log-type-select': 'changeLogType',
                'change .search-choice': 'changeSearchCondition',

                'click .watch-svc-log-btn': 'showSvcLogDetailPopup',
                'click .watch-img-log-btn': 'showImgLogDetailPopup',
                'click .watch-trx-log-btn': 'showTrxLogDetailPopup',
                'click .watch-err-log-btn': 'showErrLogDetailPopup'
            },

            currentLogType: 'svc',
            currentDetailLogType: 'svc',
            guid: null,
            linkSeq: null,
            occurDttm: null,
            msgType: null,
            bizDate: null,

            initialize: function () {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());
                if (!commonConfig.useTrxCd) {
                    that.$el.find('li.trx-code').hide();
                }

                // Dom Element Cache
                that.$onlineLogSearch = that.$el.find('.online-log-search');
                that.$onlineLogDetailTitle = that.$el.find('h3 > .online-log-detail-title');
                that.$onlineLogDetailBtn = that.$el.find('.online-log-detail-btn');

                // search form 초기화
                
                if(commonConfig.useBizDt) {
                	that.$onlineLogSearch.html(that.searchFormBiz());
                } else {
                	that.$onlineLogSearch.html(that.searchForm());
                }

               	commonUtil.setDatePicker(that.$onlineLogSearch.find('input[data-form-param="bizDate"]'), 'yy-mm-dd');
               	commonUtil.setDatePicker(that.$onlineLogSearch.find('input[data-form-param="occurDttm[0]"]'), 'yy-mm-dd');
                commonUtil.setTimePicker(that.$onlineLogSearch.find('input[data-form-param="occurDttm[1]"]'));
                commonUtil.setTimePicker(that.$onlineLogSearch.find('input[data-form-param="occurDttm[2]"]'), {
                    noneOption: [
                        {
                            'label': '23:59',
                            'value': '23:59'
                        }
                    ]
                });

               	// *bcPoc
               	commonUtil.setDatePicker(that.$onlineLogSearch.find('input[data-form-param="fromBizDate"]'), 'yy-mm-dd');
               	commonUtil.setDatePicker(that.$onlineLogSearch.find('input[data-form-param="toBizDate"]'), 'yy-mm-dd');
               	commonUtil.setDatePicker(that.$onlineLogSearch.find('input[data-form-param="errFromOccurDttm[0]"]'), 'yy-mm-dd');
               	commonUtil.setDatePicker(that.$onlineLogSearch.find('input[data-form-param="errToOccurDttm[0]"]'), 'yy-mm-dd');
                commonUtil.setTimePicker(that.$onlineLogSearch.find('input[data-form-param="errFromOccurDttm[1]"]'));
                commonUtil.setTimePicker(that.$onlineLogSearch.find('input[data-form-param="errToOccurDttm[1]"]'), {
                    noneOption: [
                        {
                            'label': '23:59',
                            'value': '23:59'
                        }
                    ]
                });

               	that.$onlineLogSearch.find('li.log-seq').hide();
                
                that.$el.find('.log-type-select').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0010']));
                that.$el.find('.search-choice').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0040']));
                that.resetSearch();

                // Set SubViews
                that.subViews['trxCodeSelectPopup'] = new TrxCodeSelectPopup();
                that.subViews['trxCodeSelectPopup'].on('select-trx-code', function (trxCode) {
                    that.$onlineLogSearch.find('input[data-form-param="trxCd"]').val(trxCode);
                });

                that.subViews['svcLogDetailPopup'] = new SvcLogDetailPopup();
                that.subViews['imgLogDetailPopup'] = new ImgLogDetailPopup();
                that.subViews['imgLogDetailPopup'].on('reload-trx-img-log', function(param) {
                	that.$onlineLogSearch.find('input[data-form-param="guid"]').val(param.guid);
                	that.$onlineLogSearch.find('input[data-form-param="bizDate"]').val(param.bizDate);
                	that.$onlineLogSearch.find('input[data-form-param="occurDttm[0]"]').val(param.occurDttm);
                	that.loadOnlineLogList();
                });
                
                that.subViews['trxLogDetailPopup'] = new TrxLogDetailPopup();
                that.subViews['errLogDetailPopup'] = new ErrLogDetailPopup();

                // loading bar 초기화
                that.subViews['detailLoadingBar'] = new LoadingBar();
                that.$el.find('.online-log-detail').append(that.subViews['detailLoadingBar'].render());


                // Set Grid
                that.onlineLogGrids = {};
                var fieldsAndColumns = {};

                // Service Log Tab 레이아웃 선택 - TrxCd 사용 여부에 따라 레이아웃이 다름
                if (commonConfig.useTrxCd) {
                    fieldsAndColumns = {
                        fields: ['opOccurDttm', 'trxCd', 'sendUserIp', 'opErrYn', 'guid', 'containerNm', 'linkSeq', 'nodeName', 'msgType', 'bizDate', 'opElapsedMills', 'cpuProcMills'],
                        columns: [
                            {text: bxMsg('online.occur-date'), flex: 12, dataIndex: 'opOccurDttm', align: 'center'},
                            {text: bxMsg('online.trx-code'), flex: 10, dataIndex: 'trxCd', align: 'center'},
                            {text: bxMsg('online.user-ip'), flex: 8, dataIndex: 'sendUserIp', align: 'center'},
                            {
                                text: bxMsg('online.success-yn'), flex: 5, dataIndex: 'opErrYn', align: 'center',
                                renderer: function (value) {
                                    return that.getSuccessYnIcon(value);
                                }
                            },
                            {text: bxMsg('online.guid'), flex: 20, dataIndex: 'guid', align: 'center',
                            	renderer: function (value) {
                            		return '<pre class="white-block-staging">' + value + '</pre>';
                            	}
                            },
                            {text: bxMsg('online.elapsed-time'), flex: 7, dataIndex: 'opElapsedMills', align: 'center',
                            	renderer: function(value) {
                            		return commonUtil.convertNumberFormat(value) + ' ms';
                            	}
                            },
                            {text: bxMsg('online.cpu-use-time'), flex: 7, dataIndex: 'cpuProcMills', align: 'center',
                            	renderer: function(value) {
                            		return commonUtil.convertNumberFormat(value) + ' ms';
                            	}
                            },
                            {text: bxMsg('online.link-seq'), flex: 7, dataIndex: 'linkSeq', align: 'center'},
                            {text: bxMsg('online.node'), flex: 6, dataIndex: 'nodeName', align: 'center'},
                            {text: bxMsg('online.container'), flex: 8, dataIndex: 'containerNm', align: 'center'}
                        ]
                    };
                } else {
                    fieldsAndColumns = {
                        fields: ['opOccurDttm', 'guid', 'sendUserIp', 'opErrYn', 'bxmAppId', 'svcNm', 'opNm', 'linkSeq', 'nodeName', 'msgType', 'bizDate'],
                        columns: [
                            {text: bxMsg('online.occur-date'), flex: 12, dataIndex: 'opOccurDttm', align: 'center'},
                            {text: bxMsg('online.guid'), flex: 20, dataIndex: 'guid', align: 'center',
                            	renderer: function (value) {
                            		return '<pre class="white-block-staging">' + value + '</pre>';
                            	}
                            },
                            {text: bxMsg('online.user-ip'), flex: 10, dataIndex: 'sendUserIp', align: 'center'},
                            {text: bxMsg('online.error-yn'), flex: 6, dataIndex: 'opErrYn', align: 'center',
                                renderer: function (value) {
                                    return that.getSuccessYnIcon(value);
                                }
                            },
                            {text: bxMsg('online.application'), flex: 8, dataIndex: 'bxmAppId', align: 'center'},
                            {text: bxMsg('online.service'), flex: 13, dataIndex: 'svcNm', align: 'center'},
                            {text: bxMsg('online.operation'), flex: 15, dataIndex: 'opNm', align: 'center'},
                            {text: bxMsg('online.node'), flex: 10, dataIndex: 'nodeName', align: 'center'}
                        ]
                    };
                }

                that.onlineLogGrids['svc'] = new ExtGrid($.extend({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineLogService', 'getServiceLogList', 'OnlineLogSearchConditionOMM'),
                        key: 'OnlineLogSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'ServiceLogListOMM',
                        key: 'serviceLogList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function () {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function () {
                                            // 요청 객체 생성
                                            var formData = commonUtil.makeParamFromForm(that.$onlineLogSearch);
                                            var requestParam = commonUtil.getBxmReqData('OnlineLogService', 'exportSvcLog', 'OnlineLogSearchConditionOMM',
	                                            {
                                            		logOccurDttmStart: formData["occurDttm[0]"]
	                                            }		
                                            );

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function (response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ],
                        content: [
                                  '<div><h3 class="bw-stt-detail clr-mg add-mg-r">' + bxMsg('online.log-total-row') + '<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><span class="bw-stt-detail-data total-row"></span></h3></div>'
                                ]
                    },
                    paging: true,
                    listeners: {
                        select: function (_this, record) {
                            that.loadOnlineLog({
                                guid: record.get('guid'),
                                linkSeq: record.get('linkSeq'),
                                opOccurDttm: record.get('opOccurDttm'),
                                msgType: record.get('msgType'),
                                bizDate: record.get('bizDate')
                            });
                        }
                    }
                }, fieldsAndColumns));

                // Image Log Tab 레이아웃 선택 - TrxCd 사용 여부에 따라 레이아웃이 다름
                if (commonConfig.useTrxCd) {
                    fieldsAndColumns = {
                        fields: ['logOccurDttm', 'trxCd', 'msgType', 'guid', 'containerNm', 'nodeName', 'bizDate', 'opElapsedMills'],
                        columns: [
                            {text: bxMsg('online.occur-date'), flex: 10, dataIndex: 'logOccurDttm', align: 'center'},
                            {text: bxMsg('online.trx-code'), flex: 10, dataIndex: 'trxCd', align: 'center'},
                            {text: bxMsg('online.msg-type'), flex: 10, dataIndex: 'msgType', align: 'center'},
                            {text: bxMsg('online.guid'), flex: 20, dataIndex: 'guid', align: 'center',
                            	renderer: function (value) {
                            		return '<pre class="white-block-staging">' + value + '</pre>';
                            	}
                            },
                            {text: bxMsg('online.node'), flex: 10, dataIndex: 'nodeName', align: 'center'},
                            {text: bxMsg('online.container'), flex: 15, dataIndex: 'containerNm', align: 'center'}
                        ]
                    };
                } else {
                    fieldsAndColumns = {
                        fields: ['logOccurDttm', 'guid', 'containerNm', 'bxmAppId', 'svcNm', 'opNm', 'nodeName', 'msgType', 'bizDate'],
                        columns: [
                            {text: bxMsg('online.occur-date'), flex: 10, dataIndex: 'logOccurDttm', align: 'center'},
                            {text: bxMsg('online.guid'), flex: 25, dataIndex: 'guid', align: 'center',
                            	renderer: function (value) {
                            		return '<pre class="white-block-staging">' + value + '</pre>';
                            	}
                            },
                            {text: bxMsg('online.msg-type'), flex: 10, dataIndex: 'msgType', align: 'center'},
                            {text: bxMsg('online.container'), flex: 12, dataIndex: 'containerNm', align: 'center'},
                            {text: bxMsg('online.application'), flex: 10, dataIndex: 'bxmAppId', align: 'center'},
                            {text: bxMsg('online.service'), flex: 10, dataIndex: 'svcNm', align: 'center'},
                            {text: bxMsg('online.operation'), flex: 12, dataIndex: 'opNm', align: 'center'},
                            {text: bxMsg('online.node'), flex: 10, dataIndex: 'nodeName', align: 'center'}
                        ]
                    };
                }

                that.onlineLogGrids['img'] = new ExtGrid($.extend({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineLogService', 'getImageLogList', 'OnlineLogSearchConditionOMM'),
                        key: 'OnlineLogSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'ImageLogListOMM',
                        key: 'imageLogList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function () {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function () {
                                            // 요청 객체 생성
                                            var formData = commonUtil.makeParamFromForm(that.$onlineLogSearch);
                                            var requestParam = commonUtil.getBxmReqData('OnlineLogService', 'exportImgLog', 'OnlineLogSearchConditionOMM',
                                            	{
                                            		logOccurDttmStart : formData["occurDttm[0]"]
                                            	}
                                            );

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function (response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ],
                        content: [
                                  '<div><h3 class="bw-stt-detail clr-mg add-mg-r">' + bxMsg('online.log-total-row') + '<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><span class="bw-stt-detail-data total-row"></span></h3></div>'
                                ]
                    },
                    paging: true,
                    listeners: {
                        select: function (_this, record) {
                            that.loadOnlineLog({
                                guid: record.get('guid'),
                                logOccurDttm: record.get('logOccurDttm'),
                                msgType: record.get('msgType'),
                                bizDate: record.get('bizDate')
                            });
                        }
                    }
                }, fieldsAndColumns));

                if (commonConfig.useTrxCd) {
                    fieldsAndColumns = {
                    		fields: ['logOccurDttm', 'trxCd', 'guid', 'linkSeq', 'sysCd', 'nodeName', 'sendUserIp', 'logSeq', 'bizDate'],
                            columns: [
                                {text: bxMsg('online.occur-date'), flex: 12, dataIndex: 'logOccurDttm', align: 'center'},
                                {text: bxMsg('online.trx-code'), flex: 10, dataIndex: 'trxCd', align: 'center'},
                                {text: bxMsg('online.guid'), flex: 25, dataIndex: 'guid', align: 'center',
                                	renderer: function (value) {
                                		return '<pre class="white-block-staging">' + value + '</pre>';
                                	}
                                },
                                {text: bxMsg('online.link-seq'), flex: 8, dataIndex: 'linkSeq', align: 'center'},
                                {text: bxMsg('online.log-seq'), flex: 8, dataIndex: 'logSeq', align: 'center'},
                                {text: bxMsg('online.system-code'), flex: 10, dataIndex: 'sysCd', align: 'center'},
                                {text: bxMsg('online.node'), flex: 8, dataIndex: 'nodeName', align: 'center'},
                                {text: bxMsg('online.sender-ip'), flex: 13, dataIndex: 'sendUserIp', align: 'center'}
                            ]		
                    		
                    };
                } else {
                    fieldsAndColumns = {
                    		fields: ['logOccurDttm', 'trxCd', 'guid', 'linkSeq', 'sysCd', 'nodeName', 'sendUserIp', 'logSeq', 'bizDate'],
                            columns: [
                                {text: bxMsg('online.occur-date'), flex: 12, dataIndex: 'logOccurDttm', align: 'center'},
                                {text: bxMsg('online.guid'), flex: 25, dataIndex: 'guid', align: 'center',
                                	renderer: function (value) {
                                		return '<pre class="white-block-staging">' + value + '</pre>';
                                	}
                                },
                                {text: bxMsg('online.link-seq'), flex: 8, dataIndex: 'linkSeq', align: 'center'},
                                {text: bxMsg('online.log-seq'), flex: 8, dataIndex: 'logSeq', align: 'center'},
                                {text: bxMsg('online.system-code'), flex: 10, dataIndex: 'sysCd', align: 'center'},
                                {text: bxMsg('online.node'), flex: 8, dataIndex: 'nodeName', align: 'center'},
                                {text: bxMsg('online.sender-ip'), flex: 13, dataIndex: 'sendUserIp', align: 'center'}
                            ]		
                    		
                    };
                }
                
                that.onlineLogGrids['trx'] = new ExtGrid($.extend({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineLogService', 'getTransactionLogList', 'OnlineLogSearchConditionOMM'),
                        key: 'OnlineLogSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'TransactionLogListOMM',
                        key: 'transactionLogList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function () {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function () {
                                            // 요청 객체 생성
                                            var formData = commonUtil.makeParamFromForm(that.$onlineLogSearch);
                                            var requestParam = commonUtil.getBxmReqData('OnlineLogService', 'exportTrxLog', 'OnlineLogSearchConditionOMM',
                                            {
                                            	logOccurDttmStart : formData["occurDttm[0]"]
                                            }		
                                            );

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function (response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ],
                        content: [
                                  '<div><h3 class="bw-stt-detail clr-mg add-mg-r">' + bxMsg('online.log-total-row') + '<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><span class="bw-stt-detail-data total-row"></span></h3></div>'
                                ]
                    },
                    paging: true,
                    listeners: {
                        select: function (_this, record) {
                            that.loadOnlineLog({
                                guid: record.get('guid'),
                                linkSeq: record.get('linkSeq'),
                                logOccurDttm: record.get('logOccurDttm'),
                                msgType: record.get('msgType'),
                                bizDate: record.get('bizDate')
                            });
                        }
                    }
                }, fieldsAndColumns));

                if(commonConfig.useBizDt) {
                	fieldsAndColumns = {
                			fields: ['logOccurDttm', 'trxCd', 'guid', 'linkSeq', 'sysCd', 'nodeName', 'sendUserIp', 'bizDt', 'sqlErrCd', 'errCd', 'chlTypeCd'],
                			columns: [
                			          {text: bxMsg('online.business-date'), flex: 8, dataIndex: 'bizDt', align: 'center',
                			        	  renderer: function(value) {
                			        		  return value ? commonUtil.changeStringToDateString(value) : value;
                			        	  }
                			          },
                			          {text: bxMsg('online.occur-date'), flex: 14, dataIndex: 'logOccurDttm', align: 'center'},
                			          {text: bxMsg('online.trx-code'), flex: 10, dataIndex: 'trxCd', align: 'center'},
                			          {text: bxMsg('online.guid'), flex: 22, dataIndex: 'guid', align: 'center',
                			        	  renderer: function (value) {
                			        		  return '<pre class="white-block-staging">' + value + '</pre>';
                			        	  }
                			          },
                			          {text: bxMsg('online.link-seq'), flex: 8, dataIndex: 'linkSeq', align: 'center'},
                			          {text: bxMsg('online.system-code'), flex: 8, dataIndex: 'sysCd', align: 'center'},
                			          {text: bxMsg('online.channel-type-code-name'), flex: 8, dataIndex: 'chlTypeCd', align: 'center',
                			        	  renderer : function(value) {
                			        		  return value ? value + '(' + commonConfig.comCdList['BXMDT0001'][value] + ')' : value;
                			        	  }
                			          },
                			          {text: bxMsg('online.err-code'), flex: 8, dataIndex: 'errCd', align: 'center'},
                			          {text: bxMsg('online.sql-err-code'), flex: 8, dataIndex: 'sqlErrCd', align: 'center'},
                			          {text: bxMsg('online.node'), flex: 8, dataIndex: 'nodeName', align: 'center'},
                			          {text: bxMsg('online.sender-ip'), flex: 8, dataIndex: 'sendUserIp', align: 'center'}
                			          ]
                	};
                } else {
                	fieldsAndColumns = {
                			fields: ['logOccurDttm', 'trxCd', 'guid', 'linkSeq', 'sysCd', 'nodeName', 'sendUserIp', 'bizDt', 'sqlErrCd', 'errCd', 'chlTypeCd'],
                			columns: [
                			          {text: bxMsg('online.occur-date'), flex: 14, dataIndex: 'logOccurDttm', align: 'center'},
                			          {text: bxMsg('online.trx-code'), flex: 10, dataIndex: 'trxCd', align: 'center'},
                			          {text: bxMsg('online.guid'), flex: 22, dataIndex: 'guid', align: 'center',
                			        	  renderer: function (value) {
                			        		  return '<pre class="white-block-staging">' + value + '</pre>';
                			        	  }
                			          },
                			          {text: bxMsg('online.link-seq'), flex: 8, dataIndex: 'linkSeq', align: 'center'},
                			          {text: bxMsg('online.system-code'), flex: 8, dataIndex: 'sysCd', align: 'center'},
                			          {text: bxMsg('online.channel-type-code-name'), flex: 8, dataIndex: 'chlTypeCd', align: 'center',
                			        	  renderer : function(value) {
                			        		  return value ? value + '(' + commonConfig.comCdList['BXMDT0001'][value] + ')' : value;
                			        	  }
                			          },
                			          {text: bxMsg('online.err-code'), flex: 8, dataIndex: 'errCd', align: 'center'},
                			          {text: bxMsg('online.sql-err-code'), flex: 8, dataIndex: 'sqlErrCd', align: 'center'},
                			          {text: bxMsg('online.node'), flex: 8, dataIndex: 'nodeName', align: 'center'},
                			          {text: bxMsg('online.sender-ip'), flex: 8, dataIndex: 'sendUserIp', align: 'center'}
                			          ]};
                }
                
                that.onlineLogGrids['err'] = new ExtGrid($.extend({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('OnlineLogService', 'getErrorLogList', 'OnlineLogSearchConditionOMM'),
                        key: 'OnlineLogSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'ErrorLogListOMM',
                        key: 'errorLogList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function () {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function () {
                                            // 요청 객체 생성
                                            var formData = commonUtil.makeParamFromForm(that.$onlineLogSearch);
                                            var requestParam = commonUtil.getBxmReqData('OnlineLogService', 'exportErrLog', 'OnlineLogSearchConditionOMM',
	                                            {
                                            		logOccurDttmStart: formData["occurDttm[0]"]
	                                            }
                                            );

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function (response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ],
                        content: [
                                  '<div><h3 class="bw-stt-detail clr-mg add-mg-r">' + bxMsg('online.log-total-row') + '<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><span class="bw-stt-detail-data total-row"></span></h3></div>'
                                ]
                    },
                    paging: true,
                    listeners: {
                        select: function (_this, record) {
                            that.loadOnlineLog({
                                guid: record.get('guid'),
                                linkSeq: record.get('linkSeq'),
                                logOccurDttm: record.get('logOccurDttm'),
                                msgType: record.get('msgType'),
                                bizDate: record.get('bizDt')
                            });
                        }
                    }
                }, fieldsAndColumns));


                // 네가지 종류의 Grid를 미리 그려 둠. 로그타입이 바뀔 때 마다 show/hide 함
                that.$onlineLogGrids = {};
                that.$onlineLogDetails = {};

                ['svc', 'img', 'trx', 'err'].forEach(function (logType) {
                    that.$onlineLogGrids[logType] = that.$el.find('.' + logType + '-log-grid');
                    that.$onlineLogDetails[logType] = that.$el.find('.' + logType + '-log-detail');
                    that.$onlineLogGrids[logType].html(that.onlineLogGrids[logType].render());
                });
            },

            render: function () {

                return this.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this,
                    params,
                    logType,
                    startDttm;
                
                //trx search & grid로 맞춰야
                if (that.currentLogType !== 'trx') {
                	that.$onlineLogGrids[that.currentLogType].hide();
                    that.$onlineLogGrids['trx'].show();
                    that.currentLogType = 'trx';
                    that.$el.find('.log-type-select').val('trx');
                    that.$onlineLogSearch.find('li.sys-cd').hide();
                    that.$onlineLogSearch.find('li.search-choice-li').hide();
                    that.$onlineLogSearch.find('li.user-ip').hide();
                    that.$onlineLogSearch.find('li.log-seq').show();
                    that.$onlineLogSearch.find('li.err-cd').hide();
                    that.$onlineLogSearch.find('li.sql-err-cd').hide();
                }

                if(pageRenderInfo && pageRenderInfo.logType === 'err') {
                    that.$onlineLogGrids[that.currentLogType].hide();
                    that.$onlineLogGrids['err'].show();
                    that.currentLogType = 'err';
                    that.$el.find('.log-type-select').val('err').trigger('change');

                    that.resetSearch();
                    commonUtil.makeFormFromParam(that.$onlineLogSearch, pageRenderInfo);
                    that.loadOnlineLogList('afterRender');

                    return;
                }

                if(pageRenderInfo && pageRenderInfo.guid) {

                    pageRenderInfo.guid = pageRenderInfo.guid.replace(/\+/gi,' ');
                    startDttm = commonUtil.changeStringToDateString(pageRenderInfo.startDttm);
                    params = {
                        guid: pageRenderInfo.guid,
                        linkSeq: pageRenderInfo.linkSeq
                    };

                    setTimeout(function () {
                        commonUtil.makeFormFromParam(that.$onlineLogSearch, params);
                        that.$onlineLogSearch.find('[data-form-param="occurDttm[0]"]').val(startDttm);
                        that.loadOnlineLogList('afterRender');
                        that.loadOnlineLog({
                            guid: pageRenderInfo.guid,
                            linkSeq: pageRenderInfo.linkSeq,
                            logOccurDttm: startDttm
                        });
                    }, 100);
                }
            },
            
            resetSearch: function () {
                this.$onlineLogSearch.find('[data-form-param]').val('');
                this.$onlineLogSearch.find('[data-form-param="bizDate"]').datepicker('setDate', commonConfig.bizDate);
                this.$onlineLogSearch.find('[data-form-param="occurDttm[0]"]').datepicker('setDate', new XDate().toString('yyyy-MM-dd'));
                this.$onlineLogSearch.find('[data-form-param="occurDttm[1]"]').val('00:00');
                this.$onlineLogSearch.find('[data-form-param="occurDttm[2]"]').val('23:59');
                
                // *bcPoc
                this.$onlineLogSearch.find('[data-form-param="fromBizDate"]').datepicker('setDate', commonConfig.bizDate);
                this.$onlineLogSearch.find('[data-form-param="toBizDate"]').datepicker('setDate', commonConfig.bizDate);
                this.$onlineLogSearch.find('[data-form-param="errFromOccurDttm[0]"]').datepicker('setDate', new XDate().toString('yyyy-MM-dd'));
                this.$onlineLogSearch.find('[data-form-param="errToOccurDttm[0]"]').datepicker('setDate', new XDate().toString('yyyy-MM-dd'));
                this.$onlineLogSearch.find('[data-form-param="errFromOccurDttm[1]"]').val('00:00');
                this.$onlineLogSearch.find('[data-form-param="errToOccurDttm[1]"]').val('23:59');
            },

            changeLogType: function (e) {
                var logType = e && $(e.currentTarget).val();
                
                if (logType === 'svc') {
                	this.$onlineLogSearch.find('li.user-ip').show();
                	this.$onlineLogSearch.find('li.sys-cd').hide();
                	this.$onlineLogSearch.find('li.search-choice-li').hide();
                	this.$onlineLogSearch.find('li.log-seq').hide();
                	this.$onlineLogSearch.find('li.err-cd').hide();

                	// *bcPoc
                	this.$onlineLogSearch.find('li.sql-err-cd').hide();
                	this.$onlineLogSearch.find('li.err-search').hide();
                    this.$onlineLogSearch.find('li.not-err-search').show();
                    if(!commonConfig.useTrxCd) {
                    	this.$onlineLogSearch.find('input[data-form-param="bxmAppId"]').parent().show();
                    	this.$onlineLogSearch.find('input[data-form-param="svcNm"]').parent().show();
                    	this.$onlineLogSearch.find('input[data-form-param="opNm"]').parent().show();
                    }
                } else if(logType === 'trx') {
                	this.$onlineLogSearch.find('li.user-ip').hide();
                    this.$onlineLogSearch.find('li.sys-cd').show();
                    this.$onlineLogSearch.find('li.search-choice-li').show();
                	this.$onlineLogSearch.find('li.log-seq').show();
                	this.$onlineLogSearch.find('li.err-cd').hide();
                	
                	// *bcPoc
                	this.$onlineLogSearch.find('li.sql-err-cd').hide();
                	this.$onlineLogSearch.find('li.err-search').hide();
                    this.$onlineLogSearch.find('li.not-err-search').show();
                    if(!commonConfig.useTrxCd) {
                    	this.$onlineLogSearch.find('input[data-form-param="bxmAppId"]').parent().hide();
                    	this.$onlineLogSearch.find('input[data-form-param="svcNm"]').parent().hide();
                    	this.$onlineLogSearch.find('input[data-form-param="opNm"]').parent().hide();
                    }
                } else if(logType === 'img') {
                	this.$onlineLogSearch.find('li.user-ip').hide();
                    this.$onlineLogSearch.find('li.sys-cd').hide();
                    this.$onlineLogSearch.find('li.search-choice-li').hide();
                	this.$onlineLogSearch.find('li.log-seq').hide();
                	this.$onlineLogSearch.find('li.err-cd').hide();
                
                	// *bcPoc
                	this.$onlineLogSearch.find('li.sql-err-cd').hide();
                	this.$onlineLogSearch.find('li.err-search').hide();
                    this.$onlineLogSearch.find('li.not-err-search').show();
                    if(!commonConfig.useTrxCd) {
                    	this.$onlineLogSearch.find('input[data-form-param="bxmAppId"]').parent().show();
                    	this.$onlineLogSearch.find('input[data-form-param="svcNm"]').parent().show();
                    	this.$onlineLogSearch.find('input[data-form-param="opNm"]').parent().show();
                    }
                } else if(logType === 'err'){
                	this.$onlineLogSearch.find('li.user-ip').hide();
                    this.$onlineLogSearch.find('li.sys-cd').hide();
                    this.$onlineLogSearch.find('li.search-choice-li').hide();
                    this.$onlineLogSearch.find('li.log-seq').hide();
                    this.$onlineLogSearch.find('li.err-cd').show();
                    
                    // *bcPoc
                    this.$onlineLogSearch.find('li.sql-err-cd').show();
                	this.$onlineLogSearch.find('li.err-search').show();
                    this.$onlineLogSearch.find('li.not-err-search').hide();
                    if(!commonConfig.useTrxCd) {
                    	this.$onlineLogSearch.find('input[data-form-param="bxmAppId"]').parent().hide();
                    	this.$onlineLogSearch.find('input[data-form-param="svcNm"]').parent().hide();
                    	this.$onlineLogSearch.find('input[data-form-param="opNm"]').parent().hide();
                    }
                }
                this.resetSearch();
                this.$el.find('.total-row').html(0); //when changing log,total log count reset
                
                if (this.currentLogType !== logType) {
                    this.$onlineLogGrids[this.currentLogType].hide();
                }
                this.$onlineLogGrids[logType].show();
                this.onlineLogGrids[logType].loadData(null, null, true, {});
                this.currentLogType = logType;
                
                this.$onlineLogDetails[this.currentLogType].find('[data-form-param]').val('');
                this.$onlineLogDetails[this.currentLogType].find('[data-form-param="opErrYn"]').html('');
                this.$onlineLogDetailTitle.text('');
            },

            changeSearchCondition: function(e) {
            	var searchCondition = e && $(e.currentTarget).val();
            	this.$el.find('.search-choice-input').attr('data-form-param', searchCondition);
            },
            
            loadOnlineLogList: function (afterRenderFlag) {
                var that = this,
                	formData = commonUtil.makeParamFromForm(this.$onlineLogSearch),
                	listName = null;
                
                //errFromOccurDttm은 bizDate, trxCd 쓰는 곳만 존재
                if(commonConfig.useTrxCd && commonConfig.useBizDt) {
                	if(!commonUtil.isTimeFormat(formData['occurDttm[1]']) || !commonUtil.isTimeFormat(formData['occurDttm[2]']) 
                			|| !commonUtil.isTimeFormat(formData['errFromOccurDttm[1]']) || !commonUtil.isTimeFormat(formData['errToOccurDttm[1]'])) {
                		swal({type: 'warning', title: '', text: bxMsg('common.time-format-check'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                		return;
                	}
                } else {
                	if(!commonUtil.isTimeFormat(formData['occurDttm[1]']) || !commonUtil.isTimeFormat(formData['occurDttm[2]'])) {
                		swal({type: 'warning', title: '', text: bxMsg('common.time-format-check'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                		return;
                	}
                }
                

                	
                
                if(afterRenderFlag == 'afterRender') {
                	var bodyParam = {
                			guid: formData.guid,
                			linkSeq: formData.linkSeq,
                			logSeq: formData.logSeq,
                			trxCd: formData.trxCd,
                			bxmAppId: formData.bxmAppId,
                			svcNm: formData.svcNm,
                			opNm: formData.opNm,
                			nodeName: formData.nodeName,
                			sendUserIp: formData.sendUserIp
                	};
                } else {
                	var bodyParam = {
                			guid: formData.guid,
                			logSeq: formData.logSeq,
                			trxCd: formData.trxCd,
                			bxmAppId: formData.bxmAppId,
                			svcNm: formData.svcNm,
                			opNm: formData.opNm,
                			nodeName: formData.nodeName,
                			sendUserIp: formData.sendUserIp
                	};
                }
                
                switch (this.currentLogType) {
                    case 'svc':
                    	listName = 'serviceLogList';
                    	$.extend(bodyParam, {
                        	bizDate: formData.bizDate,
                            opOccurDttmStart: formData['occurDttm[0]'] + ' ' + formData['occurDttm[1]'],
                            opOccurDttmEnd: formData['occurDttm[0]'] + ' ' + formData['occurDttm[2]']
                        });
                        break;
                    case 'img':
                    	listName = 'imageLogList';
                    	$.extend(bodyParam, {
                    		bizDate: formData.bizDate,
                            logOccurDttmStart: formData['occurDttm[0]'] + ' ' + formData['occurDttm[1]'],
                            logOccurDttmEnd: formData['occurDttm[0]'] + ' ' + formData['occurDttm[2]']
                        });
                        break;
                    case 'trx':
                    	listName = 'transactionLogList';
                    	$.extend(bodyParam, {
                    		bizDate: formData.bizDate,
                            logOccurDttmStart: formData['occurDttm[0]'] + ' ' + formData['occurDttm[1]'],
                            logOccurDttmEnd: formData['occurDttm[0]'] + ' ' + formData['occurDttm[2]'],
                            sysCd: formData['sysCd'],
                            custId: formData['custId'],
                            acctNo: formData['acctNo'],
                            cardNo: formData['cardNo'],
                            mngBranchNo: formData['mngBranchNo'],
                            openBranchNo: formData['openBranchNo']
                        });
                        break;
                    case 'err':
                    	listName = 'errorLogList';
                        
                    	if(commonConfig.useTrxCd && commonConfig.useBizDt) {
                    		// *bcPoc
                    		$.extend(bodyParam, {
                    			fromBizDate: formData['fromBizDate'],
                    			toBizDate: formData['toBizDate'],
                    			logOccurDttmStart: formData['errFromOccurDttm[0]'] + ' ' + formData['errFromOccurDttm[1]'],
                    			logOccurDttmEnd: formData['errToOccurDttm[0]'] + ' ' + formData['errToOccurDttm[1]'],
                    			errCd: formData['errCd'],
                    			sqlErrCd: formData['sqlErrCd'],
                    			chlTypeCd: formData['chlTypeCd']
                    		});
                    	} else {
                    		// *bcPoc
                    		$.extend(bodyParam, {
                    			fromBizDate: formData['fromBizDate'],
                    			toBizDate: formData['toBizDate'],
                    			logOccurDttmStart: formData['occurDttm[0]'] + ' ' + formData['occurDttm[1]'],
                    			logOccurDttmEnd: formData['occurDttm[0]'] + ' ' + formData['occurDttm[2]'],
                    			errCd: formData['errCd'],
                    			sqlErrCd: formData['sqlErrCd'],
                    			chlTypeCd: formData['chlTypeCd']
                    		});
                    	}
                        
                        break;
                    default:
                        return;
                }

                this.onlineLogGrids[this.currentLogType].loadData(bodyParam, function(data) {

                	that.$el.find('.total-row').html(data['totalRow']);
                	
                	data = data[listName];
                	if(data && data.length) {
                		that.$onlineLogGrids[that.currentLogType].find('tbody tr:first-child').click();
                	} else {
                		that.$onlineLogDetails[that.currentLogType].find('[data-form-param]').val('');
                		that.$onlineLogDetails[that.currentLogType].find('[data-form-param="opErrYn"]').html('');
                		that.$onlineLogDetailTitle.text('');
                	}
                }, true);
            },

            /**
             * cdId
             * */
            loadOnlineLog: function (param) {
                var that = this,
                    requestParam,
                    detailLogType = this.currentLogType;
                that.$onlineLogDetails[detailLogType].show();
                if (that.$onlineLogDetails[that.currentDetailLogType] !== that.$onlineLogDetails[detailLogType]) {
                    that.$onlineLogDetails[that.currentDetailLogType].hide();
                }

                switch (detailLogType) {
                    case 'svc':
                        that.guid = param.guid;
                        that.linkSeq = param.linkSeq;
                        that.occurDttm = param.opOccurDttm;
                        that.msgType = param.msgType;
                        that.bizDate = param.bizDate;
                        requestParam = commonUtil.getBxmReqData(
                            'OnlineLogService', 'getServiceLog', 'ServiceLogOMM',
                            {
                                guid: param.guid,
                                linkSeq: param.linkSeq,
                                opOccurDttm: param.opOccurDttm,
                                bizDate: param.bizDate
                            }
                        );
                        break;
                    case 'img':
                        that.guid = param.guid;
                        that.linkSeq = 0;
                        that.occurDttm = param.logOccurDttm;
                        that.msgType = param.msgType;
                        that.bizDate = param.bizDate;
                        requestParam = commonUtil.getBxmReqData(
                            'OnlineLogService', 'getImageLog', 'ImageLogOMM',
                            {
                                guid: param.guid,
                                logOccurDttm: param.logOccurDttm,
                                bizDate: param.bizDate
                            }
                        );
                        
                        break;
                    case 'trx':
                        that.guid = param.guid;
                        that.linkSeq = param.linkSeq;
                        that.occurDttm = param.logOccurDttm;
                        that.msgType = param.msgType;
                        that.bizDate = param.bizDate;
                        requestParam = commonUtil.getBxmReqData(
                            'OnlineLogService', 'getTransactionLog', 'TransactionLogOMM',
                            {
                                guid: param.guid,
                                linkSeq: param.linkSeq,
                                logOccurDttm: param.logOccurDttm,
                                bizDate: param.bizDate
                            }
                        );
                        break;
                    case 'err':
                        that.guid = param.guid;
                        that.linkSeq = param.linkSeq;
                        that.occurDttm = param.logOccurDttm;
                        that.msgType = param.msgType;
                        that.bizDate = param.bizDate;
                        requestParam = commonUtil.getBxmReqData(
                            'OnlineLogService', 'getErrorLog', 'ErrorLogOMM',
                            {
                                guid: param.guid,
                                linkSeq: param.linkSeq,
                                logOccurDttm: param.logOccurDttm,
                                bizDt: param.bizDate
                            }
                        );
                        break;
                    default:
                        return;
                }

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function () {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function (response) {
                        var onlineLogOMM = [];
                        switch (that.currentLogType) {
                            case 'svc':
                                onlineLogOMM = response.ServiceLogSingleOMM;
                                break;
                            case 'img':
                                onlineLogOMM = response.ImageLogSingleOMM;
                                break;
                            case 'trx':
                                onlineLogOMM = response.TransactionLogSingleOMM;
                                break;
                            case 'err':
                                onlineLogOMM = response.ErrorLogSingleOMM;
                                break;
                            default:
                                return;
                        }

                        if(onlineLogOMM.chlTypeCd) {
                        	onlineLogOMM.chlTypeCd = onlineLogOMM.chlTypeCd + '(' + commonConfig.comCdList['BXMDT0001'][onlineLogOMM.chlTypeCd] + ')';
                        }
                        
                        that.$onlineLogDetailTitle.text(that.guid);
                        commonUtil.makeFormFromParam(that.$onlineLogDetails[detailLogType], onlineLogOMM);
                        
                        if (onlineLogOMM.opErrYn) {
                            that.$onlineLogDetails[detailLogType].find('[data-form-param="opErrYn"]').html(that.getSuccessYnIcon(onlineLogOMM.opErrYn));
                        }
                        
                        if(onlineLogOMM.opElapsedMills) {
                       	 that.$onlineLogDetails[detailLogType].find('[data-form-param="opElapsedMills"]').val(commonUtil.convertNumberFormat(onlineLogOMM.opElapsedMills));
                        }
                        
                        if(onlineLogOMM.cpuProcMills) {
                       	 that.$onlineLogDetails[detailLogType].find('[data-form-param="cpuProcMills"]').val(commonUtil.convertNumberFormat(onlineLogOMM.cpuProcMills));
                        }
                        
                        var eachButton = null;
                        ['svc', 'img', 'trx', 'err'].forEach(function (logType) {
                            eachButton = that.$onlineLogDetailBtn.find('.watch-' + logType + '-log-btn');
                            if (onlineLogOMM['is' + logType.capitalizeFirstLetter() + 'Exist']) {
                                eachButton.removeClass('on');
                                eachButton.attr("disabled", false);
                            } else {
                                eachButton.addClass('on');
                                eachButton.attr("disabled", true);
                            }
                        });

                        that.currentDetailLogType = detailLogType;
                    },
                    complete: function () {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            showTrxCodeSelectPopup: function () {
                this.subViews['trxCodeSelectPopup'].render();
            },

            showSvcLogDetailPopup: function () {
                this.subViews['svcLogDetailPopup'].render({
                    guid: this.guid,
                    linkSeq: this.linkSeq,
                    opOccurDttm: this.occurDttm,
                    msgType: this.msgType
                });
            },

            showImgLogDetailPopup: function () {
                this.subViews['imgLogDetailPopup'].render({
                    guid: this.guid,
                    logOccurDttm: this.occurDttm,
                    msgType: this.msgType,
                    bizDate: this.bizDate
                });
            },

            showTrxLogDetailPopup: function () {
                this.subViews['trxLogDetailPopup'].render({
                    guid: this.guid,
                    linkSeq: this.linkSeq,
                    logOccurDttm: this.occurDttm,
                    msgType: this.msgType,
                    bizDate: this.bizDate
                });
            },

            showErrLogDetailPopup: function () {
                this.subViews['errLogDetailPopup'].render({
                    guid: this.guid,
                    linkSeq: this.linkSeq,
                    logOccurDttm: this.occurDttm,
                    msgType: this.msgType,
                    bizDate: this.bizDate
                });
            },

            getSuccessYnIcon: function (value) {
                if (value === 'Y') {
                    return '<i class="fa fa-exclamation-circle chr-c-orange font-icon-m"></i>';
                } else {
                    return '<i class="fa fa-check-circle chr-c-blue font-icon-m"></i>';
                }
            }
        });
    }
);