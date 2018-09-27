define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/309/_CAPCM309.html',
        'bx-component/bx-tree/bx-tree'
    ]
    , function (
        config,
        tpl,
        bxTree
    ) {


        /**
         * Backbone
         */
        var CAPCM309View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM309-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'change #style-setting-active-area .CAPCM309-lnWidth-wrap': 'changeBorderWidthOfActiveButton',
                'change #style-setting-active-area .CAPCM309-shadow-wrap': 'changeShadowOfActiveButton',


                'change #style-setting-inactive-area .CAPCM309-lnWidth-wrap': 'changeBorderWidthOfInactiveButton',
                'change #style-setting-inactive-area .CAPCM309-shadow-wrap': 'changeShadowOfInactiveButton',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-base-attribute-undo': 'undoButtonColor',
                'click #btn-base-attribute-reset': 'resetButtonStyle',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-save': 'saveButtonStyle',
                'click #btn-base-attribute-delete': 'deleteButtonStyle',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-style-setting-active-toggle': 'toggleStyleSettingActive',
                'click #btn-style-setting-inactive-toggle': 'toggleStyleSettingInactive',
                'click #btn-preview-toggle': 'togglePreview'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.colorSelection = [];
                this.buttonSeqNbr = 0;


                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                var that = this;


                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPCM309Tree.render());


                setTimeout(function () {
                    that.initialStyle = {};
                    that.initialActiveBtnBackgroundColor = that.$el.find('#preview-wrap #activeBtn').css('background');
                    that.initialInactiveBtnBackgroundColor = that.$el.find('#preview-wrap #inactiveBtn').css('background');
                    that.initialBtnBorderColor = that.$el.find('#preview-wrap #activeBtn').css('border-color');
                    that.initialShadowColor = 'rgba(0, 0, 0, 0)';
                    that.initialBorderWidth = '1px';
                    that.initialShadow = '0 0';


                    that.initialStyle.active = {
                        'font-family': '"Noto Sans KR",sans-serif',
                        'font-size': '14px',
                        'font-weight': 'normal',
                        'font-style': 'normal',
                        'text-decoration': 'none',
                        'letter-spacing': 'normal',
                        'line-height': 'inherit',
                        'background': that.initialActiveBtnBackgroundColor,
                        'color': 'rgb(87, 108, 197)',
                        'border-width': that.initialBorderWidth,
                        'border-color': that.initialBtnBorderColor,
                        'box-shadow': that.initialShadow
                    };


                    that.initialStyle.inactive = {
                        'font-family': '"Noto Sans KR",sans-serif',
                        'font-size': '14px',
                        'font-weight': 'normal',
                        'font-style': 'normal',
                        'text-decoration': 'none',
                        'letter-spacing': 'normal',
                        'line-height': 'inherit',
                        'background': that.initialInactiveBtnBackgroundColor,
                        'color': 'white',
                        'border-width': that.initialBorderWidth,
                        'border-color': that.initialBtnBorderColor,
                        'box-shadow': that.initialShadow
                    };


                    that.renderColorPickerBySelector('style-setting-active-area', 'fill-color', that.initialActiveBtnBackgroundColor);
                    that.renderColorPickerBySelector('style-setting-active-area', 'line-color', that.initialBtnBorderColor);
                    that.renderColorPickerBySelector('style-setting-active-area', 'shadow-color', that.initialShadowColor);
                    that.renderColorPickerBySelector('style-setting-inactive-area', 'fill-color', that.initialInactiveBtnBackgroundColor);
                    that.renderColorPickerBySelector('style-setting-inactive-area', 'line-color', that.initialBtnBorderColor);
                    that.renderColorPickerBySelector('style-setting-inactive-area', 'shadow-color', that.initialShadowColor);
                }, 0);


                this.setComboBoxes();
                this.loadTreeList();


              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM309-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPCM309-wrap #btn-base-attribute-delete')
                                    			   ]);
                return this.$el;
            },


            renderColorPickerBySelector: function (parentId, elementClass, initialColor) {
                var that = this;
                var selector = '#' + parentId + ' .' + elementClass;


                fn_renderColorPicker(this.$el.find(selector), initialColor);


                this.$el.find(selector).on('change.spectrum', function (e, tinycolor) {
                    var value = tinycolor ? tinycolor.toRgbString() : 'transparent';
                    var btnSelector = (parentId.indexOf('inactive') == -1) ? 'active' : 'inactive';
                    var attr = '';
                    var previousColor = '';
                    var shadow = '';


                    if(elementClass == 'fill-color') {
                        attr = 'background-color';
                        previousColor = that.$el.find('#preview-area .preview-wrap .bw-btn-txt.' + btnSelector).css(attr);
                    } else if(elementClass == 'line-color') {
                        attr = 'border-color';
                        previousColor = that.$el.find('#preview-area .preview-wrap .bw-btn-txt.' + btnSelector).css(attr);
                    } else {
                        attr = 'box-shadow';
                        shadow = that.$el.find('#' + parentId + ' .CAPCM309-shadow-wrap').val();
                        var previousValue = that.$el.find('#preview-area .preview-wrap .dummy.' + btnSelector).css(attr);
                        previousColor = previousValue.substr(previousValue.indexOf('r'), previousValue.indexOf(')') + 1);
                        that.$el.find('#preview-area .preview-wrap .dummy.' + btnSelector).css(attr, '1px 1px ' + value);
                        value = shadow + ' ' + value;
                    }


                    var colorInfo = {'parentId': parentId, 'class': elementClass, 'color': previousColor};


                    if(that.colorSelection.length > 9) {
                        that.colorSelection.shift();
                    }


                    that.colorSelection.push(colorInfo);
                    console.log(that.colorSelection);


                    that.$el.find('#preview-area .preview-wrap .bw-btn-txt.' + btnSelector).css(attr, value);
                });
            },


            createTree: function () {
                var that = this;


                that.CAPCM309Tree = new bxTree({
                    fields: {id: 'buttonStyleNm', value: 'buttonStyleNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.inquireStyleData(itemData);
                            console.log(itemData);
                        }
                    }
                });
            },


            setComboBoxes: function() {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "CAPCM309-active-txtStyle-wrap";
                sParam.targetId = "txtStyle";
                sParam.nullYn = "Y";
                sParam.allNm = "None";
                sParam.cdNbr = "A0496";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM309-inactive-txtStyle-wrap";
                sParam.targetId = "txtStyle";
                sParam.nullYn = "Y";
                sParam.allNm = "None";
                sParam.cdNbr = "A0496";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setButtonStyle: function (data) {
                var that = this;
                var style = {};


                this.$el.find('[data-form-param="style"]').val(data.buttonStyleNm);


                $(data.tbl).each(function (index, element) {
                    var sectionId = (index == 0) ? '#style-setting-active-area' : '#style-setting-inactive-area';
                    var buttonId = (index == 0) ? '#activeBtn' : '#inactiveBtn';


                    style = {
                        // 'font-family': element.txt,
                        // 'font-size': element.fontSize,
                        // 'color': element.fontColor,
                        // 'letter-spacing': element.letterSpacing,
                        // 'line-height': element.lineHeight,
                        // 'font-weight': element.fontWeight,
                        // 'font-style': element.fontStyle,
                        // 'text-decoration': element.txtDcrtn,
                        'background-color': element.bckgrndColorVal,
                        'border-color': element.borderColorVal,
                        'border-width': element.borderWidthVal,
                        'box-shadow': element.boxShadowVal + ' ' + element.boxShadowColorVal
                    };


                   // that.$el.find(sectionId + ' .fill-color').spectrum('set', fn_checkEmptyColor(element.bckgrndColor));
                   // that.$el.find(sectionId + ' .line-color').spectrum('set', fn_checkEmptyColor(element.borderColor));
                   // that.$el.find(sectionId + ' .shadow-color').spectrum('set', fn_checkEmptyColor(element.boxShadowColor));
                    that.$el.find(sectionId + ' .CAPCM309-lnWidth-wrap').val(element.borderWidthVal);
                    that.$el.find(sectionId + ' .CAPCM309-shadow-wrap').val(element.boxShadowVal);
                    that.$el.find(sectionId + ' .CAPCM309-txtStyle-wrap').val(element.txtStyleNm);


                    that.$el.find(buttonId).css(style);
                });


                this.$el.find('[data-form-param="style"]').prop('disabled', true);
            },


            changeBorderWidthOfActiveButton: function (e) {
                var borderWidthVal = $(e.target).val();
                this.$el.find('#preview-area #activeBtn').css('border-width', borderWidthVal);
            },


            changeShadowOfActiveButton: function (e) {
                console.log(e);
                var shadow = $(e.target).val();


                if(shadow != 'none') {
                    var shadowColor = fn_getSpectrumColorRgb(this.$el.find('#style-setting-active-area .shadow-color'));
                    shadow += ' ' + shadowColor;
                }


                this.$el.find('#preview-area #activeBtn').css('box-shadow', shadow);
            },


            changeBorderWidthOfInactiveButton: function (e) {
                var borderWidthVal = $(e.target).val();
                this.$el.find('#preview-area #inactiveBtn').css('border-width', borderWidthVal);
            },


            changeShadowOfInactiveButton: function (e) {
                var shadow = $(e.target).val();


                if(shadow != 'none') {
                    var shadowColor = fn_getSpectrumColorRgb(this.$el.find('#style-setting-inactive-area .shadow-color'));
                    shadow += ' ' + shadowColor;
                }


                this.$el.find('#preview-area #inactiveBtn').css('box-shadow', shadow);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};
                var linkData = {"header" : fn_getHeader("CAPCM3098400") , "CaStyleSvcButtonStyleIO" : sParam};


                this.treeList = [];


                sParam.instCd = $.sessionStorage('headerInstCd');


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcButtonStyleTreeList.children;


                            that.CAPCM309Tree.renderItem(list);
                            that.treeList = list;
                        }
                    }
                });
            },


            /**
             * search tree list with particular keyword
             */
            searchTreeList: function () {
                var searchKey = this.$el.find('[data-form-param="searchKey"]').val();
                var matchingItems;


                if(!searchKey) {
                    this.CAPCM309Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM309Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    for (var i = 0; i < data.children.length; i++) {
                        var temp001 = data.children[i];
                        if (temp001.inpDtoNm != null && temp001.srvcClassNm != null) {
                            if ((temp001.srvcNm.indexOf(key) > -1 || temp001.srvcCd.indexOf(key) > -1)) {
                                searchTreeList.push(temp001);
                            }
                        }
                    }
                });


                return searchTreeList;
            },


            inquireStyleData: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd           = $.sessionStorage('headerInstCd');
                sParam.buttonStyleNm    = param.buttonStyleNm;
                sParam.buttonSeqNbr     = param.buttonSeqNbr;


                var linkData = {"header": fn_getHeader("CAPCM3098401"), "CaStyleSvcButtonStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStyleSvcButtonStyleList;


                            if (data != null) {
                                that.buttonSeqNbr = data.buttonSeqNbr;
                                that.setButtonStyle(data);
                            } else {
                                that.resetButtonStyle();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            undoButtonColor: function () {
                if(this.colorSelection.length < 1) return;


                console.log(this.colorSelection);


                var colorInfo = this.colorSelection.pop();
                var btnSelector = (colorInfo.parentId.indexOf('inactive') == -1) ? 'active' : 'inactive';
                var attr = '';


                if(colorInfo.class == 'fill-color') {
                    attr = 'background-color';
                    this.$el.find('#preview-area .preview-wrap .bw-btn-txt.' + btnSelector).css(attr, colorInfo.color);
                } else if(colorInfo.class == 'line-color') {
                    attr = 'border-color';
                    this.$el.find('#preview-area .preview-wrap .bw-btn-txt.' + btnSelector).css(attr, colorInfo.color);
                } else {
                    console.log(colorInfo.shadow);
                    console.log(colorInfo.color);
                    attr = 'box-shadow';
                    var shadow = this.$el.find('#' + colorInfo.parentId + ' .CAPCM309-shadow-wrap').val();
                    this.$el.find('#preview-area .preview-wrap .bw-btn-txt.' + btnSelector).css(attr, shadow + ' ' + colorInfo.color);
                    this.$el.find('#preview-area .preview-wrap .dummy.' + btnSelector).css(attr, '1px 1px ' + colorInfo.color);
                }


                this.$el.find('#' + colorInfo.parentId + ' .' + colorInfo.class).spectrum('set', colorInfo.color);
            },


            resetButtonStyle: function () {
                this.buttonSeqNbr = 0;
                this.colorSelection.slice(0, this.colorSelection.length);
                this.colorSelection = [];


                this.$el.find('#base-attribute-area [data-form-param="style"]').val("");


                for(var i=0; i<2; i++) {
                    var sectionId = (i == 0) ? '#style-setting-active-area' : '#style-setting-inactive-area';


                    this.$el.find(sectionId + ' .fill-color').spectrum('set', this.initialActiveBtnBackgroundColor);
                    this.$el.find(sectionId + ' .line-color').spectrum('set', this.initialBtnBorderColor);
                    this.$el.find(sectionId + ' .shadow-color').spectrum('set', this.initialShadowColor);


                    this.$el.find(sectionId + ' [data-form-param="lnWidth"]').val(this.initialBorderWidth);
                    this.$el.find(sectionId + ' [data-form-param="shadow"]').val(this.initialShadow);
                    this.$el.find(sectionId + ' [data-form-param="txtStyle"]').val("");
                }


                this.$el.find('#preview-area #activeBtn').css(this.initialStyle.active);
                this.$el.find('#preview-area #inactiveBtn').css(this.initialStyle.inactive);


                this.$el.find('[data-form-param="style"]').prop('disabled', false);
            },


            saveButtonStyle: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};
                    var buttonStyle = {};


                    sParam.tblNm = [];


                    for(var i=0; i<2; i++) {
                        var buttonDscd = (i == 0) ? '01' : '02';
                        var sectionId = (i == 0) ? '#style-setting-active-area' : '#style-setting-inactive-area';


                        buttonStyle = {};
                        buttonStyle.instCd          = $.sessionStorage('headerInstCd');
                        buttonStyle.buttonDscd      = buttonDscd;
                        buttonStyle.buttonStyleNm   = that.$el.find('[data-form-param="style"]').val();
                        buttonStyle.buttonSeqNbr    = that.buttonSeqNbr;
                        //buttonStyle.bckgrndColor    = fn_getSpectrumColorRgb(that.$el.find(sectionId + ' .fill-color'));
                       // buttonStyle.borderColor     = fn_getSpectrumColorRgb(that.$el.find(sectionId + ' .line-color'));
                        buttonStyle.borderWidthVal     = that.$el.find(sectionId + ' .CAPCM309-lnWidth-wrap').val();
                        buttonStyle.boxShadowVal       = that.$el.find(sectionId + ' .CAPCM309-shadow-wrap').val();
                        //buttonStyle.boxShadowColor  = fn_getSpectrumColorRgb(that.$el.find(sectionId + ' .shadow-color'));
                        // buttonStyle.txtStyleNm      = that.$el.find(sectionId + ' .CAPCM309-txtStyle-wrap').val();
                        buttonStyle.txtStyleNm      = 'Body Style1';
                        buttonStyle.txtStyleDscd    = '03';
                        buttonStyle.txtSeqNbr       = 1;
                        sParam.tblNm.push(buttonStyle);
                    }


                    if(fn_isNull(sParam.tblNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3098100"), "CaStyleSvcSaveButtonStyleIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.resetButtonStyle();
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            deleteButtonStyle: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function deleteData() {
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.buttonDscd = '01';
                    sParam.buttonStyleNm = that.$el.find('[data-form-param="style"]').val();
                    sParam.buttonSeqNbr = that.buttonSeqNbr;


                    if(fn_isNull(sParam.buttonStyleNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3098300"), "CaStyleSvcButtonStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.resetButtonStyle();
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },


            /**
             * callback for enter input in tree
             */
            fn_enter: function (event) {
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                    this.searchTreeList();
                }
            },


            showTree: function () {
                this.$el.find('.col1').show();
                this.$el.find('.col2').css('left', '260px');
                this.$el.find('#btn-tree-show').hide();
            },


            hideTree: function () {
                this.$el.find('.col1').hide();
                this.$el.find('.col2').css('left', '30px');
                this.$el.find('#btn-tree-show').show();
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find("#btn-base-attribute-toggle"));
            },


            toggleStyleSettingActive: function () {
                fn_pageLayerCtrl(this.$el.find("#style-setting-active-area"), this.$el.find("#btn-style-setting-active-toggle"));
            },


            toggleStyleSettingInactive: function () {
                fn_pageLayerCtrl(this.$el.find("#style-setting-inactive-area"), this.$el.find("#btn-style-setting-inactive-toggle"));
            },


            togglePreview: function () {
                fn_pageLayerCtrl(this.$el.find("#preview-area"), this.$el.find("#btn-preview-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM309View;
    } // end of define function
); // end of define
