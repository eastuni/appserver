define(
    [
        '../../../../common/util',
        'common/component/popup/popup',
        'text!views/online/online-log-search/popup/err-log-detail-popup-tpl.html'
    ],
    function (commonUtil,
              Popup,
              tpl) {

        return Popup.extend({
            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .ok-btn': 'close'
            },

            initialize: function () {
                var that = this;
                that.$el.html(that.tpl());
                that.$errLogInfo = that.$el.find('.err-log-info');
                that.$rawDataTitle = that.$el.find('.raw-data-title');
                that.$rawData = that.$el.find('.raw-data');
            },

            render: function (logData) {
                var that = this;

                this.renderCode(logData);

                that.setDraggable();
                that.show();
            },

            renderCode: function (logData) {
                var that = this,
                    requestParam;

                if(logData.linkSeq == null) {
                	logData.linkSeq = 0;
                }
                
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('OnlineLogService', 'getErrorLogDetail', 'ErrorLogOMM',
                    {
                        guid: logData.guid,
                        linkSeq: logData.linkSeq,
                        logOccurDttm: logData.logOccurDttm,
                        bizDt: logData.bizDate
                    });

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function (response) {
                        var renderList = [];

                        response.LogDetailOMM.systemHeader.forEach(function (item) {
                            
                            if(item.key === 'errStacktrace') {
                            	that.$rawDataTitle.html(bxMsg('log.'+item.key) + '<span class="tab-bg"></span><span class="tab-bg-before"></span>');
                                that.$rawData.text(item.value);
                            } else if(item.key === 'guid') {
                            	renderList.push(Ext.String.format(
                                        '<tr><td>{0}</td><td>{1}</td><td><pre class="white-block-staging">{2}</pre></td></tr>',
                                        item.key,
                                        bxMsg('log.'+item.key),
                                        item.value
                                    ));
                            } else {
                            	renderList.push(Ext.String.format(
                                        '<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>',
                                        item.key,
                                        bxMsg('log.'+item.key),
                                        item.value
                                ));
                            }
                            
                        });

                        that.$errLogInfo.html(renderList);
                    }
                });
            }
        });
    }
);
