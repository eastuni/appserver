define(
    [
        'text!app/views/page/popup/CAPCM/popup-image-search.html',
        'bx-component/popup/popup'
    ],
    function (
        tpl,
        Popup
    ) {
        var popupImageSearch = Popup.extend({


            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 1020px; height: 800px;'
            },


            events: {
                'click #btn-search-condition-reset': 'reset', // 초기화
                'click #btn-search-condition-inquire': 'inquireImageList', // 목록조회


                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-search-condition-toggle': 'toggleSearchCondition', // 조회영역 접기


                'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            },


            toggleSearchCondition : function() {
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find('#btn-search-condition-toggle'));
            },


            reset : function() {
                this.$el.find("#search-condition-area [data-form-param='cdKnd'] option:eq(0)").attr("selected", "selected");
                this.$el.find("#search-condition-area [data-form-param='code']").val("");
                this.$el.find("#search-condition-area [data-form-param='cdNm']").val("");
            },


            inquireImageList : function() {
                this.trCount = -1;


                this.renderImageList();
                // var that = this;
                // var sParam = {};
                //
                // 
                // sParam.instCd       = $.sessionStorage('headerInstCd');
                // sParam.cdNbr        = that.$el.find("#search-condition-area [data-form-param='code']").val();
                // sParam.cdNbrNm      = that.$el.find("#search-condition-area [data-form-param='cdNm']").val();
                //
                // if(!sParam.cdNbr && !sParam.cdNbrNm) return;
                //
                // var linkData = {"header": fn_getHeader("CAPCM0018400"), "CaCmnCdSvcGetCdMListIn": sParam};
                //
                // 
                // bxProxy.post(sUrl, JSON.stringify(linkData), {
                //     success: function (responseData) {
                //         if (fn_commonChekResult(responseData)) {
                //             var cdList = responseData.CaCmnCdSvcGetCdMListOut.tbl;
                //             var totalCount = cdList.length;
                //
                //             if (cdList != null || cdList.length > 0) {
                //                 
                //                 that.popupCodeSearchGrid.setData(cdList);
                //                 that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                //             } else {
                //                 that.popupCodeSearchGrid.resetData();
                //             }
                //
                //             that.$el.find('#btn-popup-select').removeClass('on');
                //         }
                //     }   
                // });
            },


            toggleSearchResult : function() {
                fn_pageLayerCtrl(this.$el.find("#popup-code-search-grid"), this.$el.find('#btn-search-result-toggle'));
            },


            initialize: function (initData) {
                $.extend(this, initData);


                this.enableDim = true;
                this.initData = initData;
                this.imgCount = 10;
                this.trCount = -1;
                this.imageSrc = '';
            },


            render: function () {
                this.$el.html(this.tpl());


                // this.setComboBoxes();
                this.show();


                console.log(this.initData);


                if(!fn_isNull(this.initData)) {
                    if(!fn_isNull(this.initData.cdNbr)) {
                        this.setSearchCondition(this.initData.cdNbr);
                    }
                }
            },


            renderImageList: function () {
                var tr, td = '';


                this.$el.find('#image-search-result-area table').children().remove();


                for(var i=0; i < this.imgCount; i++) {
                    if(i % 3 == 0) {
                        tr = '<tr class=""></tr>';


                        this.$el.find('#image-search-result-area table').append(tr);


                        if(this.trCount > -1) {
                            $(this.$el.find('#image-search-result-area table tbody').children()[this.trCount]).addClass('space-under')
                        }


                        this.trCount++;
                    }


                    td = '<td class="td-w-33 a-center">'
                        + '<img src="/libs/bx/bx-frame/images/login-bg.jpg" class="preview-popup-thumbnail">'
                        + '<label class="bw-label">label</label>'
                        + '</td>';


                    var tableRows = this.$el.find('#image-search-result-area table tbody').children();
                    $(tableRows[this.trCount]).append(td);
                }


                this.attachListenerForImageSelection();
            },


            attachListenerForImageSelection: function () {
                var that = this;


                this.$el.find('.preview-popup-thumbnail').click(function (e) {
                    that.$el.find('.preview-popup-thumbnail.selected').removeClass('selected');
                    $(this).addClass('selected');
                    that.imageSrc = e.target.src;
                })
            },


            setComboBoxes: function () {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "PopupFileSrch-fileCtgry-wrap";
                sParam.targetId = "fileCtgry";
                sParam.cdNbr = "11915"; // 코드는 베이스+서비스 로 등록 되어 있다.
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);


                if(data) {
                    that.$el.find("#search-condition-area [data-form-param='fileNm']").val(data);
                }


                that.inquireImageList();
            },


            fn_select: function () {
                var param = {};


                param.fileNm = 'login-bg.jpg';
                param.src = this.imageSrc;


                this.trigger('popUpSetData', param);
                this.close();
            },


            afterClose : function() {
                this.remove();
            }


        });


        return popupImageSearch;
    }
);
