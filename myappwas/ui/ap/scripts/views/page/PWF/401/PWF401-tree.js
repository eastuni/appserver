define(
    [
        'bx/common/config'
        , 'bx-component/message/message-alert'
        , 'text!app/views/page/PWF/401/PWF401-tree-tpl.html'
        , 'app/views/page/popup/CAPCM/popup-message'
        , 'bx-component/bx-tree/bx-tree'
        , 'bx/common/common-info'
    ],
    function (config
        , alertMessage
        , tpl
        , PopupMessage
        , bxTree
        , commonInfo) {
        var PWFTreeView = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'search-filter-sidebar',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                'click .browse-btn': 'selectData'
                , 'click .browse-grid-btn': 'setListPage'
            }


            , initialize: function (initData) {
                var that = this;


                // initData 저장
                $.extend(that, initData);


                that.initData = initData;


                that.subViews['PWF401Tree'] = new bxTree({
                    fields: {id: 'nodeId', value: 'nodeNm', symbol: {text: 'P', color: '#233e77'}},
                    listeners: {
                        clickItem: function (itemId, itemData, currentTarget, e) {


                            console.log(itemData);


                            that.trigger('select-unit', itemData);
                        }
                    }
//                       , contextMenuItems: [
//                           {name: '이름 출력', handler: function(itemId, itemData, currentTarget, e) { alert(itemData.unitTskNm); } }
//                       ]
                });


                // 페이지 템플릿 설정
                that.$el.html(that.tpl());


                // DOM Element Cache
                that.$unitTreeRoot = that.$el.find('.bx-tree-root');
            }


            , render: function () {
                var that = this;


                that.$unitTreeRoot.html(this.subViews['PWF401Tree'].render());
                that.loadList();


                return that.$el;
            }


            //tree 조회
            , loadList: function () {
                var that = this;


                var sParam = {};
                var instInfo = commonInfo.getInstInfo();
                sParam.instCd = instInfo.instCd;


                if (sParam.instCd == undefined) {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));


                    return;
                }


                var linkData = {"header": fn_getHeader("PSV0048402"), "SrvcMgmtSvcGetInstSrvcTreeIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (responseData.header.errorMessageProcessed) { //에러
                            //경고창
                            that.popErrorMessage(responseData);
                        }
                        else {
                            that.subViews['PWF401Tree'].renderItem(responseData.SrvcMgmtSvcGetInstSrvcTreeOut.tbl);
                        }
                    }
                });
            }


            //경고창
            , popErrorMessage: function (responseData) {
                var messageParam = {};
                messageParam.messageCode = responseData.header.messageCode;
                messageParam.messages = responseData.header.messages;
                messageParam.detailMessages = responseData.header.detailMessages;
                messageParam.traceMessage = responseData.header.traceMessage;


                var popupMessage = new PopupMessage(messageParam); // 팝업생성
                popupMessage.render();
            }


        }); // end of Backbone.View.extend({


        return PWFTreeView;


    } // end of define function
); // end of define
