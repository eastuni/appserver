// 사용자그룹조회


define(
    [
        'bx-component/popup/popup'
        , 'text!app/views/page/popup/CAPSV/popup-userGrpCd.html'
        , 'bx/common/common-info'
    ],
    function (Popup
        , tpl
        , commonInfo) {
        var BxpUserPopup = Popup.extend({


            //템플릿설정
            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 500px; height: 300px;'
            },


            events: {
            	'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            },


            initialize: function (initConfig) {
                var that = this;


                // Set Page
                that.$el.html(this.tpl());
                // Set Page modal 설정
                that.enableDim = true;


                var sParam = {};
                var selectStyle = {};


                sParam.className = "userGrpCd-wrap";
                sParam.targetId = "userGrpCd";
//                sParam.nullYn = "Y";
                sParam.cdNbr = "11001";
                fn_getCodeList(sParam, that, selectStyle);  // 사용자그룹코드


                sParam = {};
                sParam.className = "chnlCd-wrap";
                sParam.targetId = "chnlCd";
//                sParam.nullYn = "Y";
                sParam.cdNbr = "11930";
                fn_getCodeList(sParam, that, selectStyle);  // 채널구분코드


                that.show();
            },


            render: function (param) {
                var that = this;
            },


            fn_select: function () {
                var that = this;
                var sParam = {};


                if(commonInfo.getInstInfo().instCd) {
            		sParam.instCd = commonInfo.getInstInfo().instCd;
            	}
            	else {
            		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
            	}


                sParam.userGrpCd = this.$el.find('[data-form-param="userGrpCd"]').val();
                sParam.chnlCd = this.$el.find('[data-form-param="chnlCd"]').val();
                sParam.menuLvlVal = this.$el.find('[data-form-param="menuLvl"]').val();
                sParam.lngCd = this.$el.find('[data-form-param="lngCd"]').val();


                var linkData = {"header": fn_getHeader("CAPSV0108101"), "CaMenuMgmtSvcRegisterMenuNbrIn": sParam};


                // ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {


                        // 메뉴 등록 성공시
                        if (fn_commonChekResult(responseData)) {
                            var returnMsg = responseData.CaMenuMgmtSvcRegisterMenuNbrOut;


                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));


                            sParam.menuId = returnMsg.menuId;
                            sParam.menuNm = that.$el.find('select[data-form-param="chnlCd"] option:selected').text();
                            that.trigger('popUpSetData', sParam);
                            that.close();
                        }
                    }   // end of success: function
                });     // end of bxProxy
            },


            afterClose: function () {
                this.remove();
            }


        });


        return BxpUserPopup;
    }
);
