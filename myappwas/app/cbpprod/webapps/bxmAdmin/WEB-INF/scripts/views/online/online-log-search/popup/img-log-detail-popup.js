define(
    [
     	'../../../../common/config',
        '../../../../common/util',
        'common/component/popup/popup',
        'views/online/online-log-search/popup/execute-transaction-popup',
        'text!views/online/online-log-search/popup/img-log-detail-popup-tpl.html'
    ],
    function (commonConfig,
    		  commonUtil,
              Popup,
              ExecuteTrxPopup,
              tpl
              ) {

        return Popup.extend({
            className: 'md-form',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .ok-btn': 'close',
                'click .redo-trx-btn': 'showTransExecutor'
            },

            inputRawData: null,
            
            initialize: function () {
                var that = this;
                
                //set subviews
                that.subViews['executeTrxPopup'] = new ExecuteTrxPopup();
                that.subViews['executeTrxPopup'].on('reload-trx', function(param) {
                	that.trigger('reload-trx-img-log', param);
                })
                
                that.$el.html(that.tpl());
                that.$imgLogInfo = that.$el.find('.img-log-info');
                
                that.$systemHeaderInPart = that.$imgLogInfo.find('.input-system-header-part');
                that.$dataInPart = that.$imgLogInfo.find('.input-data-part');
                that.$inRawData = that.$imgLogInfo.find('.input-raw-data');
                that.$systemHeaderOutPart = that.$imgLogInfo.find('.output-system-header-part');
                that.$dataOutPart = that.$imgLogInfo.find('.output-data-part');
                that.$outRawData = that.$imgLogInfo.find('.output-raw-data');
                
                that.$rerunButton = that.$imgLogInfo.find('.rerun-button');
                
                that.$generalInputMsg = that.$el.find('.general-input-image-log');
                that.$notGeneralInputMsg = that.$el.find('.not-xml-fld-json');
                
                if(commonConfig.extraOption['imageOutLogUse'] === 'false') {
                	that.$imgLogInfo.find('.out-first-tab').hide();
                	that.$imgLogInfo.find('.out-last-tab').hide();
                }
                
                
                // tab menu 전환 기능
                $(".tab-title li").click(function () {
                    $(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    $(".image-log-tabs").hide();
                    var activeTab = $(this).attr("rel");
                    $("#image-log-detail-popup-" + activeTab).show();
                });
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

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('OnlineLogService', 'getImageLogDetail', 'ImageLogOMM',
                    {
                        guid: logData.guid,
                        logOccurDttm: logData.logOccurDttm,
                        bizDate: logData.bizDate
                    });

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function (response) {
                        var imageLogDetailOMM = response.ImageLogDetailOMM,
                            renderList = [];

                        commonUtil.makeFormFromParam(that.$imgLogInfo, imageLogDetailOMM);

                        ['systemHeader', 'data'].forEach(function (part) {
                            renderList = [];
                            imageLogDetailOMM.inputGridData[part].forEach(function (item) {
                            	
                            	if(item.key.toLowerCase().indexOf("guid") != -1) {
                            		renderList.push(Ext.String.format(
                            				'<tr><td>{0}</td><td>{1}</td><td><pre class="white-block-staging">{2}</pre></td></tr>',
                            				item.key,
                            				item.desc,
                            				item.value
                            		))
                            	} else {
                            		renderList.push(Ext.String.format(
                            				'<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>',
                            				item.key,
                            				item.desc,
                            				item.value
                            		))
                            	}
                            	
                            });
                            that['$' + part + 'InPart'].html(renderList);
                        });
                        
                        if(imageLogDetailOMM.outputLogOccurDttm !== null) {
                        	['systemHeader', 'data'].forEach(function (part) {
                        		renderList = [];
                        		imageLogDetailOMM.outputGridData[part].forEach(function (item) {
                        			
                        			if(item.key.toLowerCase().indexOf("guid") != -1) {
                                		renderList.push(Ext.String.format(
                                				'<tr><td>{0}</td><td>{1}</td><td><pre class="white-block-staging">{2}</pre></td></tr>',
                                				item.key,
                                				item.desc,
                                				item.value
                                		))
                                	} else {
                                		renderList.push(Ext.String.format(
                                				'<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>',
                                				item.key,
                                				item.desc,
                                				item.value
                                		))
                                	}
                        		});
                        		that['$' + part + 'OutPart'].html(renderList);
                        	});
                        } else{
                        	
                        }
                        
                        if(/XML|FLD|JSON/.test(imageLogDetailOMM.msgType)) {
                            that.$notGeneralInputMsg.hide();
                            that.$generalInputMsg.show();
                            
                            that.$rerunButton.show();
                            that.inputRawData = imageLogDetailOMM.inputRawData;
                        } else {
                            that.$notGeneralInputMsg.show();
                            that.$generalInputMsg.hide();
                            
                            that.$rerunButton.hide();
                        }

                        if (imageLogDetailOMM.msgType === 'XML') {
                        	if(imageLogDetailOMM.inputRawData) {
                        		imageLogDetailOMM.inputRawData = imageLogDetailOMM.inputRawData
                        		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                        	}
                        	if(imageLogDetailOMM.outputRawData) {
                        		imageLogDetailOMM.outputRawData = imageLogDetailOMM.outputRawData
                        		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                        	}
                    
                        }
                        that.$inRawData.html(imageLogDetailOMM.inputRawData);
                        that.$outRawData.html(imageLogDetailOMM.outputRawData);
                        
                    }
                });
            },
            
            showTransExecutor: function() {
            	var that = this,
            		data = {},
            		msgType;
            	
            	data.msgData = that.$inRawData.text();
            	data.msgType = that.$imgLogInfo.find('[data-form-param="msgType"]');
            	data.encoding = that.$imgLogInfo.find('[data-form-param="msgEncodingCd"]');
            	msgType = data.msgType.val();
            	
            	if(!(msgType === 'FLD' || msgType === 'XML' || msgType === 'JSON')) {
            		swal({type: 'error', title: '', text: Ext.String.format(bxMsg('online.msg-type-no-support-msg'), msgType),timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}
            	
            	that.subViews['executeTrxPopup'].render(data, that);
            }
        });
    }
);
