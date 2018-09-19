define(
    [
        '../../../../common/util',
        'common/component/popup/popup',
        'text!views/online/online-log-search/popup/trx-log-detail-popup-tpl.html'
    ],
    function (commonUtil,
              Popup,
              tpl) {

        return Popup.extend({
            className: 'md-biz-date',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .ok-btn': 'close'
            },

            initialize: function () {
                var that = this;
                that.$el.html(that.tpl());
                that.$trxLogInfo = that.$el.find('.trx-log-info');
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
                requestParam = commonUtil.getBxmReqData('OnlineLogService', 'getTransactionLogDetail', 'TransactionLogOMM',
                    {
                        guid: logData.guid,
                        linkSeq: logData.linkSeq,
                        logOccurDttm: logData.logOccurDttm,
                        bizDate: logData.bizDate
                    });

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function (response) {
                        var renderList = [];

                        response.LogDetailOMM.systemHeader.forEach(function (item) {
                        	
                        	if(item.key === 'guid') {
                        		renderList.push(Ext.String.format(
                        				'<tr><td>{0}</td><td>{1}</td><td><pre class="white-block-staging">{2}</pre></td></tr>',
                        				item.key,
                        				bxMsg('log.'+item.key),
                        				item.value
                        		))
                        	} else {
                        		renderList.push(Ext.String.format(
                        				'<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>',
                        				item.key,
                        				bxMsg('log.'+item.key),
                        				item.value
                        		))
                        	}
                        });

                        that.$trxLogInfo.html(renderList);
                    }
                });
            }
        });
    }
);
