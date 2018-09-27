define(
		[
		 'text!app/views/page/popup/CAPCM/popup-message-tpl.html'
		 ],
		 function(tpl ) {
			var MessagePopup = Backbone.View.extend({
				//태그 이름 설정
				tagName:'section',


				className: 'bx-popup',
				//템플릿설정
				templates: {
					'tpl': tpl
				},


				events: {
					'click #cancel-btn': 'close'
					,'click .more-btn': 'showMore'
					,'click .trace-btn': 'toggleTrace'	
				},


				initialize: function(initConfig) {
					var that = this;
					$("#error-modal").html(that.tpl());


					if(!fn_isNull(initConfig)) {
						fn_pageLayerCtrl("#error-modal");


						var $detailAcordion = that.$el.find("#detailMessageAcordion");
						$detailAcordion.accordion({
						    collapsible: true,
						    active: true,
						    animate:"fast",
						    heightStyle: "content"
						  });
					}
				},


				close : function() {
					fn_pageLayerCtrl("#error-modal");
				}


				, render: function(messageInfo) {
					var that = this;


					if(!fn_isNull(messageInfo)) {
						$("#error-modal").html(that.tpl(messageInfo.errorMessages[0]));
						fn_pageLayerCtrl("#error-modal");


						var $detailAcordion = $("#detailMessageAcordion");


						$detailAcordion.accordion({
						    collapsible: true,
						    active: true,
						    heightStyle: "content"
						});
					}


					var that = this;
					var messages = "";
					var detailMessages = "";
					var messageCodeStr = bxMsg('cbb_items.SCRNITM#message-code');
					var messageStr = bxMsg('cbb_items.SCRNITM#message-messages');
					var detailMessageStr = bxMsg('cbb_items.SCRNITM#message-detailMessages');
					var moreHtml ="";
					var traceArea = "";


					that.errorMessages = messageInfo.errorMessages;


					var $detailMessageTBody = $("#detailMessageTBody");
					$detailMessageTBody.html("");


					if(that.errorMessages.length > 1) {


						for(var i = 1; i < that.errorMessages.length; i++) {
							var errorMessage = that.errorMessages[i];
							traceArea = "<tr><td>"+errorMessage.messageCode+"</td>";
							traceArea += "<td>"+errorMessage.message+"</td>";
							traceArea += "<td>"+errorMessage.detailMessage+"</td></tr>";


							$detailMessageTBody.append(traceArea);
						}
					}
				}


			});


			return MessagePopup;
		}
);
