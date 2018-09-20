define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'common/popup/batch-job-search/batch-job-search',
        'common/popup/error-message-code-search/error-message-code-search',
        'text!views/center-cut/center-cut-job-management/center-cut-job-management-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        Popup,
        BatchJobSearchPopup,
        ErrorCodePopup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large low-z-index-popup',

            templates: {
                'tpl': tpl
            },

            events: {
                // 'click [data-form-param="evntSectCn"] button': 'toggleEvntSectCn',
                'change select[data-form-param="nodeAsgnMethCd"]': 'onNodeAsgnMethCd',
                'change select[data-form-param="atmtExecClsfCd"]': 'onAtmtExecClsfCd',
                'change select[data-form-param="flwnWrkKnCd"]': 'onFlwnWrkKnCd',
                'change select[data-form-param="errPcsnMethCd"]': 'onErrPcsnMethCd',
                'click .job-search-btn': 'showBatchJobSearchPopup',
                'click .error-code-select': 'showErrorCodePopup',
                
                'click .post-job-empty-btn': 'removePostJobId',

                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '',
            renderData: {},

            initialize: function() {},

            render: function(data) {
                var that = this;
                that.mode = data ? 'edit' : 'add';

                that.$el.html(this.tpl(data));
                that.initializeView();
                that.loadCode(data);

                that.setDraggable();
                that.show();
            },

            initializeView: function () {
                var that = this;

                // Set SubViews
                that.subViews['batchJobSearchPopup'] = new BatchJobSearchPopup();
                that.subViews['batchJobSearchPopup'].on('select-code', function (jobId) {
                    that.$detailWrap.find('input[data-form-param="btchExecId"]').val(jobId);
                });

                that.subViews['errorCodePopup'] = new ErrorCodePopup();
                that.subViews['errorCodePopup'].on('select-code', function(errorCodes){
                    that.$el.find('input[data-form-param="rePcsnErrCd"]').val(errorCodes);
                });


                // DOM Element Cache
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');

                // render select tags
                that.$detailWrap.find('select[data-form-param="appLv2Cd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0013']));
                that.$detailWrap.find('select[data-form-param="appLv3Cd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0014']));
//                that.$detailWrap.find('select[data-form-param="inptDataTpCd"]')
//                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0003']));
                that.$detailWrap.find('select[data-form-param="ccCondCtrnCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0005']));
//                that.$detailWrap.find('select[data-form-param="logLv"]')
//                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0008']));
                that.$detailWrap.find('select[data-form-param="btchExecId"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0007']));
                that.$detailWrap.find('select[data-form-param="errPcsnMethCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0010']));
                that.$detailWrap.find('select[data-form-param="errStopYn"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0011']));
                that.$detailWrap.find('select[data-form-param="nodeAsgnMethCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0012']));
                // that.$detailWrap.find('select[data-form-param="ccExecParam"]')
                // 	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0016']));
                that.$detailWrap.find('select[data-form-param="schdTpCd"]')
                	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0004']));
                that.$detailWrap.find('select[data-form-param="atmtExecClsfCd"]')
                	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0007']));
                that.$detailWrap.find('select[data-form-param="flwnWrkKnCd"]')
                	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0009']));
                // that.setEvntSectCn();

                commonUtil.setTimePicker(that.$detailWrap.find('.auto-exec-time input[data-form-param="atmtExecSrtTime"]'), {
                    className: 'a-left'
                });
                commonUtil.setTimePicker(that.$detailWrap.find('.auto-exec-time input[data-form-param="atmtExecEndTime"]'), {
                    className: 'a-left',
                    noneOption: [
                        {
                            'label': '23:59',
                            'value': '23:59'
                        }
                    ]
                });
            },

            loadCode: function(data) {
                var that = this,
                    options = [];
                that.renderData = data;

                if (data) {
                    if (data['nodeAsgnMethCd'] === '1') {
                        renderNodeCnt(data, true);
                    } else {
                        renderNodeCnt(data);
                    }

                    commonUtil.makeFormFromParam(that.$detailWrap, data);
                    // that.setEvntSectCn(data['evntSectCn']);
                } else {
                    commonUtil.requestBxmAjax(commonUtil.getBxmReqData('SCC1001', 'getAvailNodeCnt', 'SCC100101In', null, 'bxmAdminCC'), {
                        success: function(response) {
                            that.newNodeList = response['SCC100104Out']['nodeList'];
                            renderNodeCnt(response['SCC100104Out'], true);
                        }
                    });
                }

                function renderNodeCnt(data, readOnly) {
                    if (data['nodeList'] && data['nodeList'].length) {
                        data['nodeList'].map(function(node) {
                            options.push(node['nodeNm']
                                + ' <input type="text" data-nodes value="' + (node['nodePrcsCnt'] || '') + '" ' + (readOnly ? 'readonly' : '') + '/>');
                        });
                        that.$detailWrap.find('div.processes-per-node').html(options);
                    } else {
                        that.$detailWrap.find('div.processes-per-node').html('');
                    }
                }

                that.onNodeAsgnMethCd();
                that.onAtmtExecClsfCd();
                that.onFlwnWrkKnCd();
                that.onErrPcsnMethCd();
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

            // toggleEvntSectCn: function (event) {
            //     var $target = $(event.currentTarget);
            //
            //     if ($target.hasClass('on')) {
            //         $target.removeClass('on');
            //     } else {
            //         $target.addClass('on');
            //     }
            // },

            onNodeAsgnMethCd: function () {
                var $target = this.$detailWrap.find('select[data-form-param="nodeAsgnMethCd"]');

                switch ($target.val()) {
                    case '1':
                        this.$detailWrap.find('div.processes-per-node input').val('').prop('readonly', true);
                        break;
                    case '2':
                        this.$detailWrap.find('div.processes-per-node input').prop('readonly', false);
                        break;
                }
            },

            onAtmtExecClsfCd: function () {
                var $target = this.$detailWrap.find('select[data-form-param="atmtExecClsfCd"]'),
                    $atmtExecSrtTimeInput = this.$detailWrap.find('.auto-exec-time input[data-form-param="atmtExecSrtTime"]'),
                    $atmtExecEndTimeInput = this.$detailWrap.find('.auto-exec-time input[data-form-param="atmtExecEndTime"]');

                if ($target.val() === '3') {
                    if (this.$detailWrap.find('.auto-exec-time input').prop('readonly')) {
                        $atmtExecSrtTimeInput.val('00:00');
                        $atmtExecEndTimeInput.val('23:59');
                    }
                    this.$detailWrap.find('.auto-exec-time input').prop('readonly', false);
                    this.$detailWrap.find('.auto-exec-time span').css('background', 'inherit');
                } else {
                    this.$detailWrap.find('.auto-exec-time input').val('').prop('readonly', true);
                    this.$detailWrap.find('.auto-exec-time span').css('background', '#eeeeee');
                }
            },

            onFlwnWrkKnCd: function () {
                var $target = this.$detailWrap.find('select[data-form-param="flwnWrkKnCd"]');

                if ($target.val() === '0') {
                    this.$detailWrap.find('input[data-form-param="inptParmCn"]').val('').prop('readonly', true);
                    this.$detailWrap.find('input[data-form-param="btchExecId"]').val('');
                    this.$detailWrap.find('.job-search-btn').hide();
                } else {
                    this.$detailWrap.find('input[data-form-param="inptParmCn"]').prop('readonly', false);
                    this.$detailWrap.find('.job-search-btn').show();
                }
            },

            onErrPcsnMethCd: function () {
                var $target = this.$detailWrap.find('select[data-form-param="errPcsnMethCd"]');

                if ($target.val() === '1') {
                    this.$detailWrap.find('input[data-form-param="rePcsnWaitEltm"]').prop('readonly', false);
                    this.$detailWrap.find('input[data-form-param="rePcsnErrCd"]').val('ALL');
                    this.$detailWrap.find('.auto-process-error-code').show();
                } else {
                    this.$detailWrap.find('input[data-form-param="rePcsnWaitEltm"]').val('').prop('readonly', true);
                    this.$detailWrap.find('input[data-form-param="rePcsnErrCd"]').val('');
                    this.$detailWrap.find('.auto-process-error-code').hide();
                }
            },

            showBatchJobSearchPopup: function () {
                this.subViews['batchJobSearchPopup'].render('centerCut');
            },

            showErrorCodePopup: function() {
                this.subViews['errorCodePopup'].render({
                	errorCodes: this.$el.find('input[data-form-param="rePcsnErrCd"]').val()
                });
            },

            removePostJobId: function() {
            	this.$detailWrap.find('input[data-form-param="btchExecId"]').val('')
            },
            
            saveItem: function() {
                var that = this,
                    $askFormItems = that.$detailWrap.find('.asterisk'),
                    formParam = commonUtil.makeParamFromForm(that.$detailWrap),
                    operation;

                // required values validation
                for(var i = 0 ; i < $askFormItems.length ; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param') || $askFormItem.parent().find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text() || $askFormItem.parent().find('.bw-label').text();

                    if(!formParam[key]){
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // process count validation
                var totalProcesses = 0;
                var receivedNodeList = (that.mode === 'edit') ? that.renderData['nodeList'] : that.newNodeList;
                var nodeList = [];
                that.$detailWrap.find('.processes-per-node [data-nodes]').each(function (i, item) {
                    var receivedNode = receivedNodeList[i];
                    var nodes = parseInt($(item).val());
                    nodeList.push({
                        ccId: formParam['ccId'],
                        nodeNo: receivedNode['nodeNo'],
                        nodeType: receivedNode['nodeType'],
                        nodePrcsCnt: nodes
                    });
                    totalProcesses += nodes;
                });

                if (formParam['nodeAsgnMethCd'] === '2' && parseInt(formParam['paraPrcsCnt']) !== totalProcesses) {
                    swal({type: 'warning', title: '', text: bxMsg('common.paraPrcsCnt-not-matched-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                formParam['nodeList'] = nodeList;


                // var evntSectCn = '';
                // this.$detailWrap.find('[data-form-param="evntSectCn"] button').each(function(i, item) {
                //     evntSectCn += $(item).hasClass('on') ? '1' : '0';
                // });
                // formParam['evntSectCn'] = evntSectCn;


                // Ajax request
                operation = (that.mode === 'edit') ? 'modifyCcutMain' : 'createCcutMain';

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('SCC1001', operation, 'SCC100101In', formParam, 'bxmAdminCC'), {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
                            that.close();
                        } else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        } else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
