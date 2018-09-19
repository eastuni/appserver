define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/300/_CAPCM300.html'
    ]
    , function (
        config,
        tpl
    ) {


        /**
         * Backbone
         */
        var CAPCM300View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM300-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'click #btn-base-color-undo': 'undoBaseColor',


                'click #btn-base-color-save': 'saveBaseColor',


                'click #btn-base-color-toggle': 'toggleBaseColor'
            },


            /**
             * 초기화
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.colorSelection = [];
                this.previousColorInfo = null;


                this.initData = initData;
            },


            /**
             * 렌더
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());


                this.renderColorPickerBySelector('userTheme', 'header');
                this.renderColorPickerBySelector('userTheme', 'popup');
                this.renderColorPickerBySelector('userTheme', 'body');
                this.renderColorPickerBySelector('userTheme', 'footer');


                this.inquireThemeData();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM300-wrap #btn-base-color-save')
                                    			   ]);
                return this.$el;
            },


            renderColorPickerBySelector: function (parentId, elementClass) {
                var that = this;
                var selector = '#' + parentId + ' .' + elementClass;


                fn_renderColorPicker(this.$el.find(selector));


                this.$el.find(selector).on('change.spectrum', function (e, tinycolor) {
                    var color = tinycolor ? tinycolor.toRgbString() : 'transparent';
                    var attr = (elementClass == 'text') ? 'color' : 'background-color';
                    var inputWrap = that.$el.find('#' + parentId + ' .theme-wrap');
                    var replacer = that.$el.find(selector + ' + .sp-replacer');
                    var previousColor = '';


                    if(elementClass == 'body') {
                        previousColor = inputWrap.css(attr);
                        inputWrap.css(attr, color);
                    } else if(elementClass == 'text') {
                        previousColor = replacer.css(attr);
                        (inputWrap.children()).each(function (index, element) {
                            $(element).css(attr, color);
                        });
                    } else {
                        previousColor = replacer.css(attr);
                        replacer.css(attr, color);
                    }


                    var colorInfo = {'parentId': parentId, 'class': elementClass, 'color': previousColor};


                    if(that.colorSelection.length > 9) {
                        that.colorSelection.shift();
                    }


                    that.colorSelection.push(colorInfo);


                    console.log(that.colorSelection);
                });
            },


            renderTheme: function (data) {
                var that = this;
                var attr = '';


                $(data).each(function (index, element) {
                    if(element.themeDscd == '04') {
                        attr = 'background-color';


                        that.$el.find('[data-form-param="' + element.themeDscd + '"] .header + .sp-replacer').css(attr, element.styleHdrCntnt);
                        that.$el.find('[data-form-param="' + element.themeDscd + '"] .popup + .sp-replacer').css(attr, element.stylePopupCntnt);
                        that.$el.find('[data-form-param="' + element.themeDscd + '"] .footerCntnt + .sp-replacer').css(attr, element.styleFooterCntnt);
                        that.$el.find('[data-form-param="' + element.themeDscd + '"] .theme-wrap').css(attr, element.styleBdyVal);
                    }


                    if(element.styleThemeDfltYn == 'Y') {
                        that.$el.find('input[value="' + element.themeDscd + '"]').prop('checked', true);
                    }


                    that.$el.find('[data-form-param="' + element.themeDscd + '"] .styleSeqNbr').val(element.styleSeqNbr);
                });
            },


            inquireThemeData: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');


                var linkData = {"header": fn_getHeader("CAPCM3008401"), "CaStyleSvcStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var table = responseData.CaStyleSvcGetStyleListOut.tblNm;


                            if(table != null && table.length > 0) {
                                that.renderTheme(table);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            undoBaseColor: function () {
                if(this.colorSelection.length < 1) return;


                var colorInfo = this.colorSelection.pop();
                var inputWrap = this.$el.find('#' + colorInfo.parentId + ' .theme-wrap');
                var replacer = this.$el.find('#' + colorInfo.parentId + ' .' + colorInfo.class + ' + .sp-replacer');
                var attr = (colorInfo.class  == 'text') ? 'color' : 'background-color';


                if(colorInfo.class == 'body') {
                    inputWrap.css(attr, colorInfo.color);
                } else {
                    replacer.css(attr, colorInfo.color);
                }
            },


            saveBaseColor: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};
                    var radioValue = that.$el.find('input[name=themeGroup]:checked').val();
                    var theme = '[data-form-param="' + radioValue + '"]';
                    var attr = '';


                    console.log(radioValue);
                    console.log(theme);


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.themeDscd    = radioValue;
                    sParam.styleBdyVal  = that.$el.find(theme + ' .theme-wrap').css('background-color');
                    sParam.styleSeqNbr  = parseInt(that.$el.find(theme + ' .styleSeqNbr').val());
                    sParam.styleThemeDfltYn  = 'Y';


                    if(radioValue == '04') {
                        attr = 'background-color';
                        sParam.styleHdrCntnt          = that.$el.find(theme + ' .header + .sp-replacer').css(attr);
                        sParam.stylePopupCntnt        = that.$el.find(theme + ' .popup + .sp-replacer').css(attr);
                        sParam.styleFooterCntnt       = that.$el.find(theme + ' .footerCntnt + .sp-replacer').css(attr);
                    } else {
                        attr = 'background-color';
                        sParam.styleHdrCntnt          = that.$el.find(theme + ' .header').css(attr);
                        sParam.stylePopupCntnt        = that.$el.find(theme + ' .popup').css(attr);
                        sParam.styleFooterCntnt       = that.$el.find(theme + ' .footer').css(attr);
                    }


                    console.log(sParam);


                    if(fn_isNull(sParam.themeDscd)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3008100"), "CaStyleSvcStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            toggleBaseColor: function () {
                fn_pageLayerCtrl(this.$el.find('#base-color-area'), this.$el.find('#btn-base-color-toggle'))
            }
        }); // end of Backbone.View.extend({


        return CAPCM300View;
    } // end of define function
); // end of define
