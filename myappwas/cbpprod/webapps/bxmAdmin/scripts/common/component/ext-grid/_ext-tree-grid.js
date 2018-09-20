define(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar',
        'text!common/component/ext-grid/_ext-tree-grid-tpl.html'
    ],
    function (
        commonUtil,
        LoadingBar,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',
            className: 'bx-ext-grid',

            templates: {
                'tpl': tpl
            },

            events: {
                'resize-component .manual-resize-component': 'resizeGrid',

                'change .change-grid-height-select': 'changeGridHeight',
                'click .expand-grid-tree-btn': 'expandAllTreeNode',
                'click .collapse-grid-tree-btn': 'collapseAllTreeNode',
                'click .toggle-grid-btn': 'toggleGrid',

                'click .move-btn': 'movePage',
                'click .move-first-btn': 'moveFirstPaging',
                'click .move-prev-btn': 'movePrevPaging',
                'click .move-next-btn': 'moveNextPaging',
                'click .move-last-btn': 'moveLastPaging'
            },

            grid: null,
            store: null,
            bodyParam: null,
            activePagingId: null, // 0부터 시작
            activeBtnId: null, // 1부터 시작,

            customHeight: null,
            gridDefaultHeight: 33,
            gridRowHeight: 25,
            pagingDisplayCount: 5,
            currentPageRowCount: null,  // 현재 로드된 페이지의 전체 줄 수

            gridToggle: true,
            pageCountList: [5, 10, 20, 30],
            pageCountDefaultVal: 10,

            httpMethod: 'post',

            /**
             * ----bxm 옵션-----
             *  requestParam: {obj, key} ,그리드 데이터 요청 파라미터 **필수입력
             *  responseParam: {objKey, key} ,그리드 데이터 응답 파라미터 **필수입력
             * ----non-bxm(normal http) 옵션-----
             *  url: String . 요청 URL **필수입력
             *  responseKey: String ,그리드 데이터 응답 파라미터 필드 키값
             *  httpMethod: String .요청 메소드 (디폴트 post)
             *
             * ----common 옵션-----
             *  gridToggle: boolean ,그리드 토글 버튼 사용 여부 (디폴트 true)
             *  header: { 그리드 헤더
             *      pageCount: boolean ,페이지 카운트 사용 여부,
             *      pageCountList: [] .페이지 카운트 리스트 (디폴트 10, 20, 30)
             *      pageCountDefaultVal: int .디폴트 페이지 카운트 값, 없으면 첫번째 값
             *      treeExpand: boolean .트리노드 expand 사용 여부.
             *      button: [{
             *          html: string ,추가될 버튼 html,
             *          event: function ,추가될 버튼 이벤트
             *      }]
             *      content: [] .헤더 내용
             *  }
             *  customHeight: %/px : 그리드 높이를 지정
             * ----ext 옵션----
             *  fields: [] ,그리드 필드 **필수입력
             *  columns: [] ,그리드 컬럼 **필수입력
             *  listeners: {} ,그리드 리스너,
             *  storeListeners: {} ,스토어 리스너,
             *  gridConfig: {} ,그리드 기타 항목
             */
            initialize: function (config) {
                var that = this,
                    btnList = [];

                $.extend(that, config);

                if(config.header &&  config.header.pageCountList) {
                    that.pageCountList = config.header.pageCountList;
                }

                that.$el.html(that.tpl({pageCountList: that.pageCountList}));

                // Set SubViews
                that.subViews['gridLoadingBar'] = new LoadingBar();

                // Dom Element Cache
                that.$grid = that.$el.find('.bx-grid');
                that.$gridPaging = that.$el.find('.bx-grid-paging');
                that.$gridHeader = that.$el.find('.bx-grid-header');

                //페이징
                !that.paging && that.$gridPaging.hide();

                //그리드 토글
                !that.gridToggle && that.$el.find('.toggle-grid-btn').hide();

                //헤더
                if(that.header) {
                    //페이지 카운트
                    !that.header.pageCount && that.$el.find('.change-grid-height-select').hide();

                    //페이지 카운트 디폴트 값
                    that.$gridHeader.find('.change-grid-height-select').val(that.pageCountDefaultVal);

                    if(that.header.pageCountDefaultVal) {
                        that.pageCountDefaultVal = that.header.pageCountDefaultVal;
                        that.$gridHeader.find('.change-grid-height-select').val(that.pageCountDefaultVal);
                    }

                    //트리 그리드 토글 버튼
                    !that.header.treeExpand && that.$el.find('.toggle-grid-tree-btn').hide();

                    //헤더 버튼
                    that.header.button && that.header.button.forEach(function(button) {
                        btnList.push($(button.html).on('click', button.event));
                    });
                    that.$gridHeader.find('.btn-wrap').prepend(btnList);

                    if (that.header.content) {
                        var contentList = [];
                        that.header.content.forEach(function (html) {
                            contentList.push(html);
                        });
                        that.$gridHeader.find('.header-content').html(contentList).show();
                    }
                }else{
                    that.$gridHeader.hide();
                }

                //그리드 리스너
                that.listeners || (that.listeners = {});
                that.listeners.scope = that.grid;

                //그리드 스토어
                that.initStore(config.fields, config.storeListeners);
            },

            /**
             * renderAfter : 렌더링 후 호출될 함수
             * gridSize: {width, height}, 그리드 사이즈
             */
            render: function (renderAfter, gridSize) {
                var that = this;

                //grid size setting
                gridSize || (gridSize = {});
                that.width = gridSize.width ? gridSize.width : '100%';
                if (that.customHeight) {
                    that.height = that.customHeight;
                } else if (gridSize.height){
                    that.height = gridSize.height;
                }else{
                    that.height = that.pageCountDefaultVal ? that.getGridHeight(that.pageCountDefaultVal) : that.getGridHeight(that.pageCountList[0]);
                }

                that.$grid.width(that.width).height(that.height).html(that.subViews['gridLoadingBar'].render());

                //grid render
                $.elementReady(that.el, function () {
                    (that.grid === null) && that.renderGrid();
                    renderAfter && renderAfter();
                });

                return that.$el;
            },

            initStore: function(fields) {
                fields.push({name: 'leaf', convert: function (value, record) {
                    return (!record.data.children) || (record.data.children.length === 0);
                }});

                this.store = Ext.create('Ext.data.TreeStore', {fields: fields});
            },

            setStoreRootNode: function (fieldData) {
                this.store.setRootNode({
                    expanded: true,
                    text: "My Root",
                    children: fieldData
                });
            },

            renderGrid: function () {
                var that = this,
                    gridConts = {
                        store: that.store,
                        header: false,
                        style: {
                            width: that.width
                        },

                        useArrows: true,
                        rootVisible: false,
                        multiSelect: true,
                        sortableColumns: false,

                        emptyText: bxMsg('common.no-data-msg'),
                        viewConfig: {
                            deferEmptyText: false,
                            enableTextSelection : true
                        },

                        setSizePack: function() {
                            this.setSize(that.width, that.height).update();
                        },

                        columns: that.columns,

                        height: that.height,
                        renderTo: that.$grid[0],

                        listeners: that.listeners
                    };

                $.extend(true, gridConts, that.gridConfig);

                that.grid = Ext.create('Ext.tree.Panel', gridConts);
            },

            resizeGrid: function () {
                this.grid && this.grid.setSizePack();
            },

            loadData: function (param, loadAfter, initActivePaging, data, key) {
                var that = this,
                    pageCount,
                    pageNum;

                that.bodyParam = param;

                // active 페이징 저장
                if(initActivePaging){
                    that.activePagingId = 0;
                    that.activeBtnId = 1;
                }else{
                    that.activePagingId = that.$gridPaging.find('.bx-paging.on').attr('data-id');
                    that.activePagingId = that.activePagingId && parseInt(that.activePagingId);
                    that.activeBtnId = that.$gridPaging.find('.move-btn.on').attr('data-id');
                    that.activeBtnId = that.activeBtnId && parseInt(that.activeBtnId);
                }

                if (data) {
                    // data, key 값이 있는 경우 그 값으로 로드하고
                    that.renderData(data, key);
                    loadAfter && loadAfter(data);
                } else {
                    // 없는 경우 Ajax 요청
                    if (commonUtil.isBxm()) {
                        var requestParam = this.requestParam.obj;

                        param = param || {};
                        requestParam[this.requestParam.key] = param;

                        if(that.header && that.header.pageCount) {
                            pageCount = that.$gridHeader.find('.change-grid-height-select').val();
                            requestParam[this.requestParam.key]['pageCount'] = pageCount;
                        }

                        if(that.paging) {
                            pageNum = (initActivePaging) ? 1 : that.$gridPaging.find('.move-btn.on').attr('data-id');
                            requestParam[this.requestParam.key]['pageNum'] = pageNum.toString();
                        }

                        commonUtil.requestBxmAjax(requestParam,{
                            beforeSend: function() {
                                that.subViews['gridLoadingBar'].show();
                            },
                            success: function(response) {
                                that.renderData(response[that.responseParam.objKey], that.responseParam.key);
                                loadAfter && loadAfter(response[that.responseParam.objKey]);
                            },
                            complete: function() {
                                that.subViews['gridLoadingBar'].hide();
                            }
                        });
                    } else {
                        if(that.paging) {
                            param.pageNumber = (initActivePaging) ? 1 : parseInt(this.$gridPaging.find('.move-btn.on').attr('data-id'));
                            param.pageSize = that.getPageSize();
                        }

                        bxProxy[that.httpMethod](that.url, param, {
                            beforeSend: function() {
                                that.subViews['gridLoadingBar'].show();
                            },
                            success: function(response) {
                                that.renderData(response, that.responseKey);
                                loadAfter && loadAfter(response);
                            },
                            complete: function() {
                                that.subViews['gridLoadingBar'].hide();
                            }
                        });
                    }
                }
            },

            renderData: function (data, key) {
                var pageSize,
                    renderData = key ? data[key] : data;

                this.setStoreRootNode(renderData);

                // 그리드 페이징 렌더
                pageSize = data['totalPage'];
                (pageSize === 0) && (pageSize = 1);
                pageSize && this.renderPagingBtn(pageSize);
            },

            reloadData: function (loadAfter, initActivePaging) {
                this.loadData(this.bodyParam, loadAfter, initActivePaging);
            },

            toggleGrid: function(e) {
                var $gridToggleIcon = $(e.currentTarget).find('.fa-forward');

                if(this.$grid.is(':visible')) {
                    this.$grid.hide();
                    this.$gridPaging.hide();
                    $gridToggleIcon.removeClass('fa-rotate-270').addClass('fa-rotate-90');
                }else{
                    this.$grid.show();
                    this.$gridPaging.show();
                    $gridToggleIcon.removeClass('fa-rotate-90').addClass('fa-rotate-270');
                }
            },

            changeGridHeight: function(e) {
                var $target = $(e.currentTarget);

                // change grid height
                this.setGridHeight(parseInt($target.val()));
            },

            setGridHeight: function(rowCount) {
                rowCount = rowCount || this.pageCountDefaultVal;
                this.$grid.height(this.getGridHeight(rowCount));
                this.height = this.getGridHeight(rowCount);
                this.resizeGrid();
            },

            getGridHeight: function(gridRowCount) {
                return this.gridDefaultHeight + (this.gridRowHeight * gridRowCount);
            },

            movePage: function(e) {
                // change paging btn active
                this.$gridPaging.find('.move-btn.on').removeClass('on');
                $(e.currentTarget).addClass('on');

                // load grid data
                this.reloadData();
            },

            renderPagingBtn: function(pageSize) {
                var pagingSize,
                    $pagingList,
                    $paging,
                    btnSize,
                    $btnList,
                    $btn,
                    btnId;

                $pagingList = [];
                pagingSize = Math.ceil(pageSize / this.pagingDisplayCount);

                for(var i = 0; i < pagingSize; i ++) {
                    $paging = $('<div class="bx-paging" data-id="'+ i +'">');

                    (i === this.activePagingId) && $paging.addClass('on');

                    $btnList = [];
                    btnSize = (i === pagingSize - 1) ? pageSize % this.pagingDisplayCount : this.pagingDisplayCount;
                    (btnSize === 0) && (btnSize = this.pagingDisplayCount);

                    for(var j = 1; j <= btnSize; j++) {
                        btnId = (j + (i * this.pagingDisplayCount));
                        $btn = $('<button type="button" class="btn-paging move-btn" data-id="' + btnId +'">' + btnId +'</button>');

                        (i === this.activePagingId && btnId === this.activeBtnId) && $btn.addClass('on');

                        $btnList.push($btn);
                    }

                    $paging.html($btnList);
                    $pagingList.push($paging);
                }

                this.$gridPaging.find('.bx-paging-btn').html($pagingList);

                this.setEnableMoveBtn();
            },

            setEnableMoveBtn: function() {
                var $pagingList = this.$gridPaging.find('.bx-paging'),
                    $activePaging = $pagingList.filter('.on'),
                    totalPagingLength = $pagingList.length,
                    activePagingIndex = $pagingList.index($activePaging);

                if(activePagingIndex === 0) {
                    // 보여지는 페이징이 첫번째인 경우
                    this.$gridPaging.find('.move-first-btn').attr('disabled', true).removeClass('on');
                    this.$gridPaging.find('.move-prev-btn').attr('disabled', true).removeClass('on');
                }else if(activePagingIndex > 0) {
                    // 보여지는 페이징이 첫번째가 아닌 경우
                    this.$gridPaging.find('.move-first-btn').attr('disabled', false).addClass('on');
                    this.$gridPaging.find('.move-prev-btn').attr('disabled', false).addClass('on');
                }

                if(activePagingIndex === totalPagingLength - 1) {
                    // 보여지는 페이징이 마지막인 경우
                    this.$gridPaging.find('.move-next-btn').attr('disabled', true).removeClass('on');
                    this.$gridPaging.find('.move-last-btn').attr('disabled', true).removeClass('on');
                }else if(activePagingIndex < totalPagingLength - 1) {
                    // 보여지는 페이징이 마지막이 아닌 경우
                    this.$gridPaging.find('.move-next-btn').attr('disabled', false).addClass('on');
                    this.$gridPaging.find('.move-last-btn').attr('disabled', false).addClass('on');
                }
            },

            moveFirstPaging: function() {
                var $firstPaging = this.$gridPaging.find('.bx-paging').first();

                this.$gridPaging.find('.bx-paging.on').removeClass('on');
                $firstPaging.addClass('on');

                $firstPaging.find('.move-btn').first().click();

                this.setEnableMoveBtn();
            },

            movePrevPaging: function() {
                var $activePaging = this.$gridPaging.find('.bx-paging.on'),
                    $prevPaging = $activePaging.prev();

                $activePaging.removeClass('on');
                $prevPaging.addClass('on');

                $prevPaging.find('.move-btn').last().click();

                this.setEnableMoveBtn();
            },

            moveNextPaging: function() {
                var $activePaging = this.$gridPaging.find('.bx-paging.on'),
                    $nextPaging = $activePaging.next();

                $activePaging.removeClass('on');
                $nextPaging.addClass('on');

                $nextPaging.find('.move-btn').first().click();

                this.setEnableMoveBtn();
            },

            moveLastPaging: function() {
                var $lastPaging = this.$gridPaging.find('.bx-paging').last();

                this.$gridPaging.find('.bx-paging.on').removeClass('on');
                $lastPaging.addClass('on');

                $lastPaging.find('.move-btn').last().click();

                this.setEnableMoveBtn();
            },

            getAllData: function() {
                var dataList = [],
                    dataObj, rawData, dataKey;

                makeTreeData(dataList, this.store.getRootNode().childNodes);

                function makeTreeData (dataArray, childNodes) {
                    childNodes.forEach(function (childRecord) {
                        dataObj = {};
                        rawData = childRecord.raw;

                        for(dataKey in rawData){
                            if (rawData.hasOwnProperty(dataKey)) {
                                dataObj[dataKey] = childRecord['data'][dataKey];
                            }
                        }

                        dataArray.push(dataObj);
                        dataObj.children = [];

                        makeTreeData(dataObj.children, childRecord.childNodes);
                    });
                }

                return dataList;
            },

            expandAllTreeNode: function() {
                this.grid.getRootNode().expandChildren(true);
            },

            collapseAllTreeNode: function() {
                this.grid.getRootNode().collapseChildren(true)
            },

            setDisabled: function() {
                this.$gridHeader.find('.change-grid-height-select').prop('disabled', true);
                this.$gridPaging.find('button').prop('disabled', true);
            },

            setEnabled: function() {
                this.$gridHeader.find('.change-grid-height-select').prop('disabled', false);
                this.$gridPaging.find('button').prop('disabled', false);
            },

            showGridLoadingBar: function() {
                this.subViews['gridLoadingBar'].show();
            },

            hideGridLoadingBar: function() {
                this.subViews['gridLoadingBar'].hide();
            }
        });
    }
);
