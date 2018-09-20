define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/304/_CAPCM304.html',
        'bx-component/bx-tree/bx-tree',
        'app/views/page/popup/CAPCM/popup-image-search'
    ]
    , function (
        config,
        tpl,
        bxTree,
        PopupImageSearch
    ) {


        /**
         * Backbone
         */
        var CAPCM304View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM304-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-image-search': 'openImageSearchPopup',


                'click #btn-upload': 'clickUploadButton',
                'change #input-upload': 'selectImageFile',


                'click #btn-base-attribute-reset': 'resetImageAttribute',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-save': 'saveImageAttribute',
                'click #btn-base-attribute-delete': 'deleteImageAttribute',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-preview-toggle': 'togglePreview'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.isNewImage = true;
                this.imageBinaryData = '';
                this.initialPreviewColor = '#ffffff';
                this.bsicValYn = 'N';


                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPCM304Tree.render());


                this.renderColorPickerBySelector('.btn-wrap', '.preview-color', this.initialPreviewColor);
                this.setComboBoxes();
                this.loadTreeList();
                this.$el.find('#btn-base-attribute-delete').prop('disabled', true);

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM304-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPCM304-wrap #btn-base-attribute-delete')
                                    			   ]);
                return this.$el;
            },


            renderColorPickerBySelector: function (parent, child, initialColor) {
                var that = this;
                var selector = parent + ' ' + child;


                fn_renderColorPicker(this.$el.find(selector), initialColor);


                this.$el.find(selector).on('change.spectrum', function (e, tinycolor) {
                    var value = tinycolor ? tinycolor.toRgbString() : 'transparent';


                    that.$el.find('#preview-area').css('background-color', value);
                });
            },


            createTree: function () {
                var that = this;


                that.CAPCM304Tree = new bxTree({
                    fields: {id: 'fileNm', value: 'fileNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            if(itemData.atchmntFileCntnt) {
                                that.inquireStyleData(itemData);
                                console.log(itemData);
                            }
                        }
                    }
                });
            },


            setComboBoxes: function () {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "CAPCM304-fileCtgry-wrap";
                sParam.targetId = "fileCtgry";
                sParam.nullYn = "N";
                sParam.cdNbr = "A0569";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setImageAttribute: function (data) {
                var isDefaultImage = (data.bsicValYn == 'Y');


                console.log(isDefaultImage);


                this.isNewImage = false;
                this.imageBinaryData = data.fileExtnsnNm + ',' + data.atchmntFileCntnt;


                this.$el.find('.CAPCM304-fileCtgry-wrap').val(data.imgDscd);
                this.$el.find('[data-form-param="fileNm"]').val(data.fileNm);
                this.$el.find('[data-form-param="fileDesc"]').val(data.fileDescCntnt);
                this.$el.find('#preview-area .preview-img').attr('src', this.imageBinaryData);


                this.$el.find('.CAPCM304-fileCtgry-wrap').prop('disabled', true);
                this.$el.find('[data-form-param="fileNm"]').prop('disabled', true);


                this.$el.find('#btn-base-attribute-delete').prop('disabled', isDefaultImage);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM3048400") , "CaStyleSvcImageStyleIO" : sParam};


                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcImageStyleTreeList.children;


                            if(list != null) {
                                that.CAPCM304Tree.renderItem(list);
                                that.treeList = list;
                            }
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
                    this.CAPCM304Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM304Tree.renderItem(matchingItems);
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


                sParam.instCd   = $.sessionStorage('headerInstCd');
                sParam.imgDscd  = param.imgDscd;
                sParam.fileNm   = param.fileNm;
                sParam.fileDescCntnt = param.fileDescCntnt;


                var linkData = {"header": fn_getHeader("CAPCM3048401"), "CaStyleSvcImageStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStyleSvcImageStyleIO;


                            if (data != null) {
                                that.setImageAttribute(data);
                            } else {
                                that.resetImageAttribute();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            openImageSearchPopup: function () {
                var that = this;


                this.popupImageSearch = new PopupImageSearch();
                this.popupImageSearch.render();
                this.popupImageSearch.on('popUpSetData', function (data) {
                    if(!data.src) return;


//                    that.$el.find('#base-attribute-area .CAPCM304-fileCtgry-wrap').val(data.imgDscd);
                    that.$el.find('#base-attribute-area [data-form-param="fileNm"]').val(data.fileNm);
                    that.$el.find('#base-attribute-area [data-form-param="fileDesc"]').val(data.fileDescCntnt);
                    that.$el.find('#preview-area .preview-img').attr('src', data.src);


                    that.$el.find('#base-attribute-area .CAPCM304-fileCtgry-wrap').prop('disabled', true);
                    that.$el.find('#base-attribute-area [data-form-param="fileNm"]').prop('disabled', true);


                    that.isNewImage = false;
                });
            },


            clickUploadButton: function () {
                this.$el.find('#input-upload').click();
            },


            selectImageFile: function (event) {
                var that = this;
                var files = event.target.files;
                console.log(event);


                if (files && files[0]) {
                    var FR = new FileReader();
                    FR.onload = function(e) {
                        console.log(e);
                        that.imageBinaryData = e.target.result;
                        that.$el.find('#preview-area .preview-img').attr('src', e.target.result);
                    };
                    that.$el.find('#base-attribute-area [data-form-param="fileNm"]').val(files[0].name);
                    FR.readAsDataURL(files[0]);
                }
            },


            resetImageAttribute: function () {
                this.isNewImage = true;
                this.bsicValYn = 'N';


                this.$el.find('#base-attribute-area [data-form-param="fileCtgry"] option:eq(0)').prop('selected', true);
                this.$el.find('#base-attribute-area [data-form-param="fileNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="fileDesc"]').val("");


                this.$el.find('#base-attribute-area [data-form-param="fileCtgry"]').prop('disabled', false);
                this.$el.find('#base-attribute-area [data-form-param="fileNm"]').prop('disabled', false);


                this.$el.find('#preview-area .preview-img').attr('src', '');


                this.$el.find('.preview-color').spectrum('set', this.initialPreviewColor);
                this.$el.find('#preview-area').css('background-color', this.initialPreviewColor);


                this.$el.find('#btn-base-attribute-delete').prop('disabled', false);
            },


            saveImageAttribute: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                var sParam = {};
                sParam.imgDscd 		= that.$el.find('.CAPCM304-fileCtgry-wrap').val();
                sParam.fileNm	    = that.$el.find('[data-form-param="fileNm"]').val();
                
                if(fn_isNull(sParam.imgDscd) || fn_isNull(sParam.fileNm)) {
                    fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    return;
                }
                
                function saveData() {
                    var sParam = {};
                    var srvcCd = that.isNewImage ? 'CAPCM3048100' : 'CAPCM3048200';


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.imgDscd 		= that.$el.find('.CAPCM304-fileCtgry-wrap').val();
                    sParam.fileNm	    = that.$el.find('[data-form-param="fileNm"]').val();
                    sParam.fileDescCntnt	    = that.$el.find('[data-form-param="fileDesc"]').val();
                    sParam.bsicValYn    = that.bsicValYn;
                    sParam.atchmntFileCntnt  = that.imageBinaryData;


                    console.log(sParam);

                    var linkData = {"header": fn_getHeader(srvcCd), "CaStyleSvcImageStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회


                                if(that.isNewImage) {
                                    that.loadTreeList();
                                    that.resetImageAttribute();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            deleteImageAttribute: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function deleteData() {
                    var sParam = {};


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.imgDscd 		= that.$el.find('.CAPCM304-fileCtgry-wrap').val();
                    sParam.fileNm	    = that.$el.find('[data-form-param="fileNm"]').val();
                    sParam.fileDescCntnt	    = that.$el.find('[data-form-param="fileDesc"]').val();
                    sParam.atchmntFileCntnt  = that.imageBinaryData;


                    console.log(sParam);


                    if(fn_isNull(sParam.imgDscd) || fn_isNull(sParam.fileNm) || fn_isNull(sParam.atchmntFileCntnt)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3048300"), "CaStyleSvcImageStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.loadTreeList();
                                that.resetImageAttribute();
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


            togglePreview: function () {
                fn_pageLayerCtrl(this.$el.find("#preview-area"), this.$el.find("#btn-preview-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM304View;
    } // end of define function
); // end of define


