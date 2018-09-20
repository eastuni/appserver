define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-error-log/_deferred-error-log-tpl.html'
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
                'change .bxm-search-wrap select': 'loadList',
                'change .bxm-search-wrap input[data-form-param="bizDt"]': 'loadList',
                'click .deferred-search-btn': 'showDeferredSearchPopup',

                'click .play-btn': 'restartDeferred',

                'click .refresh-btn': 'loadDetails'
            },

            currentDetailsParams: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());


                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();

                that.subViews['deferredSearchPopup'] = new DeferredSearchPopup();
                that.subViews['deferredSearchPopup'].on('select-code', function (deferredId) {
                    that.$searchWrap.find('input[data-form-param="deferredId"]').val(deferredId);
                    that.loadList();
                });


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdErrLogService', 'getDfrdErrLogListUsingPaging', 'DfrdErrLog01IO'),
                        key: 'DfrdErrLog01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdErrLogList01IO',
                        key: 'dfrdErrLog'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'deferredNm', 'nodeNo', 'bizDt', 'errSeq', 'currErrReprocCnt', 'errProcStatusCd', 'errRegDttm', 'errGuid', 'errProcTypeCd', 'startSeq', 'endSeq'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 2, dataIndex: 'deferredNm',  align: 'center'},
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.errorSeqNo'), flex: 1, dataIndex: 'errSeq',  align: 'center'},
                        {text: bxMsg('deferred.reprocessingCount'), flex: 1, dataIndex: 'currErrReprocCnt',  align: 'center'},
                        {
                            text: bxMsg('deferred.errorProcessingStatus'), flex: 2, dataIndex: 'errProcStatusCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMDF0005'][value];
                            }
                        },
                        {
                            text: bxMsg('deferred.errorRegisterDatetime'), flex: 2, dataIndex: 'errRegDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        }
                        ,{
                            text: bxMsg('deferred.restart'), width: 40, dataIndex: '',  align: 'center',
                            renderer: function (value, p, record){
                                if (/1|4/.test(record.get('errProcStatusCd'))) {
                                    return Ext.String.format(
                                        '<button type="button" class="bw-btn play-btn" data-id="{0}" data-node="{1}" data-biz="{2}" data-err="{3}" data-err-guid="{4}" data-proc-type="{5}" data-start-seq="{6}" data-end-seq="{7}"><i class="fa fa-play chr-c-green"></i></button>',
                                        record.get('deferredId'),
                                        record.get('nodeNo'),
                                        record.get('bizDt'),
                                        record.get('errSeq'),
                                        record.get('errGuid'),
                                        record.get('errProcTypeCd'),
                                        record.get('startSeq'),
                                        record.get('endSeq')
                                    );
                                } else {
                                    return '';
                                }

                            }
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.loadDetails({
                                deferredId: record.get('deferredId'),
                                nodeNo: record.get('nodeNo'),
                                bizDt: record.get('bizDt'),
                                errSeq: record.get('errSeq')
                            });
                        }
                    }
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
                that.$errorStatus = that.$searchWrap.find('.errorStatus');
            },

            render: function() {
                var that = this;

                //errorStatus setting
                that.$errorStatus.html(function (){
                	var cdList = commonConfig.comCdList['BXMDF0005'],
                		errorStatus = [];
                	
                	[3, 1, 2, 4].forEach(function (item) {
                		errorStatus.push('<input type="checkbox" class="bw-input ipt-radio" value="' + item + '"/>' +
                            '<span class="f-l" style="margin-right: 30px; margin-left: 10px;">' + cdList[item] + '</span>');
                	});
                	
                	return errorStatus;
                })
                
                
                //bizDate setting
                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="bizDt"]'), 'yy-mm-dd');
                that.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', commonConfig.bizDate);

                that.$searchWrap.find('select[data-form-param="errProcStatusCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0005'], true));

                that.$gridWrap.html(that.grid.render(function(){
//                    that.resetSearch();
                    that.loadList();
                }));

                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this;

                if(pageRenderInfo && pageRenderInfo.deferredId) {
                    that.loadDetails({
                        deferredId: pageRenderInfo.deferredId,
                        bizDt: pageRenderInfo.bizDt,
                        nodeNo: parseInt(pageRenderInfo.nodeNo),
                        errSeq: parseInt(pageRenderInfo.errSeq)
                    });
                }
                
                if(pageRenderInfo && pageRenderInfo.errCount) {
                	that.$errorStatus.find('input[value="1"]').prop('checked', true);
                	that.$errorStatus.find('input[value="2"]').prop('checked', true);
                	that.$errorStatus.find('input[value="3"]').prop('checked', false);
                	that.$errorStatus.find('input[value="4"]').prop('checked', true);
                }
                
//                if(pageRenderInfo && pageRenderInfo.errProcStatusCd) {
//                	that.$searchWrap.find('select[data-form-param="errProcStatusCd"]').val(pageRenderInfo.errProcStatusCd);
//                }
                
                if(pageRenderInfo && pageRenderInfo.bizDt) {
                	that.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', pageRenderInfo.bizDt);
                }
                
                this.loadList();
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', commonConfig.bizDate);
                this.$errorStatus.find('input').prop('checked', false);
            },

            loadList: function() {
                var that = this,
                subList = [],
                	params = commonUtil.makeParamFromForm(this.$searchWrap);

                params.bizDt = params.bizDt.replace(/-/g, '');
                
                //errorStatus multi select search condition
                this.$errorStatus.find('input:checked').each(function(i, item) {
                	subList.push({
                		errProcStatusCd: $(item).val()
                	})
                });
                params.subList = subList;
                
                this.grid.loadData(params, function(data) {
                	data = data['dfrdErrLog'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	} else {
                		that.$detailWrap.find('[data-form-param]').val('');
                		that.$detailTitle.text('');
                	}
                }, true);
            },

            loadDetails: function(params) {
                var that = this,
                    requestParam;

                if (!params.target) {
                    this.currentDetailsParams = params;
                } else {
                    params = this.currentDetailsParams;
                }

                if (!params) {
                    return;
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'DfrdErrLogService', 'getDfrdErrLogDetail', 'DfrdErrLog01IO', params);

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['DfrdErrLog01IO'];

                        that.$detailTitle.text(data.deferredId);

                        data['bizDt'] = commonUtil.changeStringToDateString(data['bizDt']);
                        data['errRegDttm'] = commonUtil.changeStringToFullTimeString(data['errRegDttm']);
                        data['procEndDttm'] = commonUtil.changeStringToFullTimeString(data['procEndDttm']);

                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            },

            restartDeferred: function (event) {
                var that = this,
                    $target = $(event.currentTarget),
                    requestParam;

                requestParam = commonUtil.getBxmReqData(
                    'DfrdErrLogService', 'restartDeferredService', 'DfrdErrLog01IO',
                    {
                        deferredId: $target.attr('data-id'),
                        nodeNo: $target.attr('data-node'),
                        bizDt: $target.attr('data-biz'),
                        errSeq: $target.attr('data-err'),
                        errGuid: $target.attr('data-err-guid'),
                        errProcTypeCd: $target.attr('data-proc-type'),
                        startSeq: $target.attr('data-start-seq'),
                        endSeq: $target.attr('data-end-seq')
                    }
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        } else if(code === 201) {
                            swal({type: 'error', title: '', text: bxMsg('deferred.restartFailMessage'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                        //그리드 reload
                        that.grid.reloadData();
                    }
                });
            }
        });
    }
);