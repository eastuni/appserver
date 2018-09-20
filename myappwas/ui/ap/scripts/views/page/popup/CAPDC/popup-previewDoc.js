define([
        'text!app/views/page/popup/CAPDC/popup-previewDoc.html'
        , 'bx-component/popup/popup'
    ],
    function (tpl
        , Popup) {


    	var gPreviewCntnt = "";


        var BxpUserPopup = Popup.extend({


            //템플릿설정
            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 700px; height: 740px;'
            },


            events: {
                'click #btn-popup-cancel': 'close'
            }
            /**
             * 초기화 
             */
            ,initialize: function (initConfig) {
                var that = this;


                this.$el.html(this.tpl());


                $.extend(that, initConfig);


                that.enableDim = true;


                if(initConfig.previewCntnt) gPreviewCntnt = initConfig.previewCntnt;
            }
            ,render: function () {
            	document.getElementById('previewCntnt-wrap').contentWindow.document.write(gPreviewCntnt);
                this.show();
            }
            /**
             * 취소버튼 클릭 후 이벤트 처리 
             */
            , afterClose : function() {
                var that = this;
                that.remove();
            }         
        });


        return BxpUserPopup;
    }
);
