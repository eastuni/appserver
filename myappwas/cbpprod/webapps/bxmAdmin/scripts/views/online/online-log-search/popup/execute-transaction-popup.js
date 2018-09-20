define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'common/component/loading-bar/_loading-bar',
        'text!views/online/online-log-search/popup/execute-transaction-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        LoadingBar,
        tpl
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                tpl: tpl
            },

            events: {
                'click .run-online-btn': 'executeTransaction',
                'click .cancel-btn': 'close'
            },

            msgData: null,
            msgType: null,
            encoding: null,
            
            initialize: function() {
                this.subViews['runLoadingBar'] = new LoadingBar();
            },

            render: function(data, parent) {
            	
            	this.msgData = data.msgData;
            	this.msgType = data.msgType;
            	this.encoding = data.encoding;
            	this.parent = parent;

                this.$el.html(this.tpl(data));
                this.$el.find('.execute-transaction-popup').parent().append(this.subViews['runLoadingBar'].render());
                this.$module = this.$el.find('.module');

                this.loadUrlList();
                this.setDraggable();

                this.show();
            },

            loadUrlList: function() {
                var that = this,
                    $onlineUrlList = that.$el.find('.online-url-list');

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('OnlineExecutionService', 'getOnlineUrlList', 'EmptyOMM'), {
                    success: function(response) {
                        var onlineUrlList = response.OnlineUrlListOMM.urlList,
                            list = [];

                        onlineUrlList.forEach(function(onlineUrl) {
                            list.push('<tr>' +
                                '<td><input type="radio" name="URL" class="bw-input ipt-radio" data-form-param="selectedUrl" data-value="' + onlineUrl.onlineUrl + '"></td>' +
                                '<td>' + onlineUrl.onlineUrl + '</td>' +
                                '<td>' + onlineUrl.onlineUrlDesc + '</td>' +
                                '</tr>');
                        });

                        $onlineUrlList.html(list);
                        $onlineUrlList.find('input').first().prop("checked", true);
                    }
                });
            },


            executeTransaction: function() {
                var that = this,
                    requestParam,
                    url;

                url =that.$el.find('input[name="URL"]:checked').attr('data-value');
                
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'OnlineExecutionService', 'executeTransaction', 'ExecuteTranInOMM',
                    {
                    	onlineUrl : url,
                    	msgData : that.msgData,
                    	msgType : that.msgType.val(),
                    	encoding : that.encoding.val()
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['runLoadingBar'].show();
                    },
                    success: function(response) {
                        var code = response.ExecuteTranOutOMM.responseCode,
                        	newGuid = response.ExecuteTranOutOMM.newGuid,
                        	trxResponseCode = response.ExecuteTranOutOMM.trxResponseCode;

                        if(code === 200){
                            swal({
                            	type: 'success', 
                            	title: '', 
                            	text:  Ext.String.format(bxMsg('online.online-re-execute-success-msg'), newGuid, trxResponseCode),
                            	html: true,
                            	confirmButtonText: bxMsg('online.check-log'),
                            	cancelButtonText: bxMsg('common.cancel'),
                            	showConfirmButton: true,
                            	showCancelButton: true
                            	},
                            function(isConfirm) {
                            		
                            	if(isConfirm) {
                            		that.close();
                            		that.parent && that.parent.close();
                            		that.trigger('reload-trx', {guid :newGuid, bizDate: commonConfig.bizDate, occurDttm: new XDate().toString('yyyy-MM-dd')});
                            	}
                            });
                            
                        } else if (code === 201){
                            swal({type: 'error', title: '', text: bxMsg('online.online-re-execute-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['runLoadingBar'].hide();
                    }
                });
            }
        });
    }
);
