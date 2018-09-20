define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/305/_CAPCM305.html',
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
        var CAPCM305View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM305-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-setting-image-attribute-reset': 'resetSettingImageAttribute',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-setting-image-attribute-save': 'saveSettingImageAttribute',
                'click #btn-setting-image-attribute-delete': 'deleteSettingImageAttribute',


                'click #btn-image-search': 'openImageSearchPopup',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-setting-image-toggle': 'toggleSettingImage',
                'click #btn-setting-image-attribute-toggle': 'toggleSettingImageAttribute'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.imgCount = 5;
                this.trCount = -1;
                this.isBannerImagesOne = true;
                this.imgDscd = '02';

                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPCM305Tree.render());


                this.loadTreeList();
                this.renderImageList();
                this.$el.find('#btn-setting-image-attribute-delete').prop('disabled', true);

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM305-wrap #btn-setting-image-attribute-save')
                                    		,this.$el.find('.CAPCM305-wrap #btn-setting-image-attribute-delete')
                                    			   ]);
                return this.$el;
            },


            renderImageList: function (data) {
                var that = this;
                var tr, td = '';


                this.trCount = -1;
                this.$el.find('#setting-image-area table').children().remove();


                $(data).each(function (index, element) {
                    if(index % 3 == 0) {
                        tr = '<tr class=""></tr>';


                        that.$el.find('#setting-image-area table').append(tr);


                        if(that.trCount > -1) {
                            $(that.$el.find('#setting-image-area table tbody').children()[that.trCount]).addClass('space-under')
                        }


                        that.trCount++;
                    }


                    td = '<td class="td-w-33 a-center">'
                        + '<img src="' + element.fileExtnsnNm + ',' + element.atchmntFileCntnt + '" class="preview-thumbnail"'
                        + ' filenm="' + element.fileNm + '" link="' + element.imgLnkngAddrCntnt + '"  category="' + element.imgDscd + '"'
                        + ' seqNbr="' + element.seqNbr + '">'
                        + '<label class="bw-label">' + element.fileNm + ' / ' + element.fileDescCntnt + '</label>'
                        + '</td>';


                    var tableRows = that.$el.find('#setting-image-area table tbody').children();
                    $(tableRows[that.trCount]).append(td);
                });


                this.attachListenerForImageSelection();
            },


            attachListenerForImageSelection: function () {
                var that = this;


                this.$el.find('.preview-thumbnail').click(function (e) {
                    that.$el.find('.preview-thumbnail.selected').removeClass('selected');
                    $(this).addClass('selected');
                    that.$el.find('#setting-image-attribute-area .preview-banner-img').attr('src', e.target.src);


                    that.$el.find('[data-form-param="fileNm"]').val(e.target.attributes['filenm'].value);
                    that.$el.find('[data-form-param="link"]').val(e.target.attributes['link'].value);


                    that.$el.find('[data-form-param="fileNm"]').prop('disabled', true);
                    that.$el.find('#btn-setting-image-attribute-delete').prop('disabled', that.isBannerImagesOne);


                    that.imgDscd = e.target.attributes['category'].value;
                    that.seqNbr = e.target.attributes['seqNbr'].value;
                })
            },


            createTree: function () {
                var that = this;


                that.CAPCM305Tree = new bxTree({
                    fields: {id: 'scrnId', value: 'scrnId'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.inquireBannerData(itemData);
                            console.log(itemData);
                        }
                    }
                });
            },


            setBannerAttribute: function (data) {
                this.isBannerImagesOne = (data.length == 1);


                this.$el.find('[data-form-param="pgNm"]').val(this.scrnNm);
                this.$el.find('[data-form-param="pgDesc"]').val(this.scrnDescCntnt);


                this.renderImageList(data);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd   = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM3058400") , "CaStyleSvcScrnBannerIO" : sParam};


                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            if(fn_commonChekResult(responseData)) {
                                var list = responseData.CaStyleSvcScrnBannerTreeList.children;


                                if(list != null && list.length > 0) {
                                    that.CAPCM305Tree.renderItem(list);
                                    that.treeList = list;
                                }
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
                    this.CAPCM305Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM305Tree.renderItem(matchingItems);
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


            inquireBannerData: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd           = $.sessionStorage('headerInstCd');
                sParam.scrnId           = param.scrnId;
                sParam.scrnNm           = param.scrnNm;
                sParam.seqNbr           = param.seqNbr;


                this.scrnId     = param.scrnId;
                this.scrnNm     = param.scrnNm;
                this.scrnDescCntnt   = param.scrnDescCntnt;


                var linkData = {"header": fn_getHeader("CAPCM3058401"), "CaStyleSvcScrnBannerIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcScrnBannerList.tbl;


                            if (list != null) {
                                that.setBannerAttribute(list);
                                that.resetSettingImageAttribute();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            resetSettingImageAttribute: function () {
                this.seqNbr = 0;


                this.$el.find('#setting-image-attribute-area [data-form-param="fileNm"]').val("");
                this.$el.find('#setting-image-attribute-area [data-form-param="link"]').val("");


                this.$el.find('#setting-image-attribute-area [data-form-param="fileNm"]').prop('disabled', false);
                this.$el.find('#setting-image-attribute-area .preview-banner-img').attr('src', '');
                this.$el.find('#btn-setting-image-attribute-delete').prop('disabled', true);
            },


            saveSettingImageAttribute: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                var sParam = {};
                sParam.fileNm   	        = that.$el.find('[data-form-param="fileNm"]').val();
                if(fn_isNull(sParam.fileNm)) {
                    fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd 		        = $.sessionStorage('headerInstCd');
                    sParam.scrnId               = that.scrnId;
                    sParam.scrnNm   	        = that.$el.find('[data-form-param="pgNm"]').val();
                    sParam.scrnDescCntnt 	        = that.$el.find('[data-form-param="pgDesc"]').val();
                    sParam.seqNbr    	        = that.seqNbr;
                    sParam.imgDscd              = that.imgDscd;
                    sParam.fileNm   	        = that.$el.find('[data-form-param="fileNm"]').val();
                    sParam.imgLnkngAddrCntnt    = that.$el.find('[data-form-param="link"]').val();


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader("CAPCM3058100"), "CaStyleSvcScrnBannerIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                var param = {};


                                param.scrnId    = that.scrnId;
                                param.scrnNm    = that.$el.find('[data-form-param="pgNm"]').val();
                                param.scrnDescCntnt  = that.$el.find('[data-form-param="pgDesc"]').val();
                                param.seqNbr    = that.seqNbr;


                                that.inquireBannerData(param);


                                if(!that.seqNbr) {
                                    that.resetSettingImageAttribute();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            deleteSettingImageAttribute: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function deleteData() {
                    var sParam = {};


                    sParam.instCd 		        = $.sessionStorage('headerInstCd');
                    sParam.scrnId               = that.scrnId;
                    sParam.scrnNm   	        = that.$el.find('[data-form-param="pgNm"]').val();
                    sParam.scrnDescCntnt 	        = that.$el.find('[data-form-param="pgDesc"]').val();
                    sParam.seqNbr    	        = that.seqNbr;
                    sParam.imgDscd              = that.imgDscd;
                    sParam.fileNm   	        = that.$el.find('[data-form-param="fileNm"]').val();
                    sParam.imgLnkngAddrCntnt    = that.$el.find('[data-form-param="link"]').val();


                    console.log(sParam);


                    if(fn_isNull(sParam.fileNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3058300"), "CaStyleSvcScrnBannerIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                var param = {};


                                param.scrnId    = that.scrnId;
                                param.scrnNm    = that.$el.find('[data-form-param="pgNm"]').val();
                                param.scrnDescCntnt  = that.$el.find('[data-form-param="pgDesc"]').val();
                                param.seqNbr    = that.seqNbr;


                                that.inquireBannerData(param);
                                that.resetSettingImageAttribute();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },


            openImageSearchPopup: function () {
                var that = this;
                var param = {};


                param.imgDscd = '02';


                this.popupImageSearch = new PopupImageSearch(param);
                this.popupImageSearch.render();
                this.popupImageSearch.on('popUpSetData', function (data) {
                    that.$el.find('#setting-image-attribute-area [data-form-param="fileNm"]').val(data.fileNm);
                    that.$el.find('#setting-image-attribute-area .preview-banner-img').attr('src', data.src);
//                    that.imgDscd = data.imgDscd;
                });
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


            toggleSettingImage: function () {
                fn_pageLayerCtrl(this.$el.find("#setting-image-area"), this.$el.find("#btn-setting-image-toggle"));
            },


            toggleSettingImageAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#setting-image-attribute-area"), this.$el.find("#btn-setting-image-attribute-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM305View;
    } // end of define function
); // end of define


