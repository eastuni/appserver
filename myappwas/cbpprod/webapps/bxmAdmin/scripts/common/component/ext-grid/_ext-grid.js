define(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar',
        'text!common/component/ext-grid/_ext-grid-tpl.html'
    ],
    function (
        commonUtil,
        LoadingBar,
        tpl
    ) {
        var ExtGrid = Backbone.View.extend({
            tagName: 'section',
            className: 'bx-ext-grid',

            templates: {
                'tpl': tpl
            },

            events: {
                'resize-component .manual-resize-component': 'resizeGrid',

                'change .change-grid-height-select': 'changeGridHeight',
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
            requestParam: {
                key: 'localData',
                obj: {}
            },
            activePagingId: null, // 0부터 시작
            activeBtnId: null, // 1부터 시작,

            gridDefaultHeight: 33,
            gridRowHeight: 26,
            pagingDisplayCount: 5,
            currentPageRowCount: null,  // 현재 로드된 페이지의 전체 줄 수

            gridToggle: true,
            pageCountList: [5, 10, 20, 30],
            pageCountDefaultVal: 10,

            loadingBarAvailable: true,

            /**
             * ----admin 옵션-----
             *  requestParam: {obj, key} ,그리드 데이터 요청 파라미터 **필수입력
             *  responseParam: {objKey, key} ,그리드 데이터 응답 파라미터 **필수입력
             *  paging: boolean ,페이징 사용 여부
             *  pageCountDefaultVal: int .디폴트 페이지 카운트 값, 없으면 첫번째 값
             *  gridToggle: boolean ,그리드 토글 버튼 사용 여부 (디폴트 true)
             *  header: { 그리드 헤더
             *      pageCount: boolean ,페이지 카운트 사용 여부
             *      pageCountList: [] .페이지 카운트 리스트 (디폴트 10, 20, 30)
             *      button: [{
             *          html: string ,추가될 버튼 html,
             *          event: function ,추가될 버튼 이벤트
             *      }]
             *      content: [] .헤더 내용
             *  }
             *  clr: 그리드 Class
             *  loadingBarAvailable: 로딩바 사용 여부 디폴드 true
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
                that.clr && that.$el.addClass(that.clr);

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
                    !that.header.pageCount && that.$gridHeader.find('.change-grid-height-select').hide();

                    if(that.header.pageCountDefaultVal) {
                        that.pageCountDefaultVal = that.header.pageCountDefaultVal;
                    }

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

                if (that.pageCountDefaultVal) {
                    that.$gridHeader.find('.change-grid-height-select').val(that.pageCountDefaultVal);
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
                if(gridSize.height){
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

            initStore: function(fields, listeners) {
                var param = {};

                fields && (param.fields = fields);
                fields && (param.listeners = listeners);

                this.store = Ext.create('Ext.data.Store', param);
            },

            renderGrid: function () {
                var that = this,
                    gridConts = {
                        store: that.store,
                        header: false,
                        style: {
                            width: that.width
                        },

                        emptyText: bxMsg('common.no-data-msg'),
                        viewConfig: {
                            deferEmptyText: false,
                            enableTextSelection : true
                        },

                        setSizePack: function() {
                            this.setSize(that.width, that.height);
                        },

                        columns: that.columns,

                        height: that.height,
                        renderTo: that.$grid[0],

                        plugins: that.plugins,

                        selModel: that.selModel,

                        listeners: that.listeners
                    };

                $.extend(true, gridConts, that.gridConfig);

                (that.checkbox) && (gridConts.selType = 'checkboxmodel');
                (that.cell) && (gridConts.selType = 'cellmodel');

                that.grid = Ext.create('Ext.grid.Panel', gridConts);
            },

            resizeGrid: function () {
                this.grid && this.grid.setSizePack();
            },

            loadData: function (bodyParam, loadAfter, initActivePaging, data, key) {
                var that = this,
                    requestParam,
                    pageCount,
                    pageNum;

                // 요청 객체 생성
                requestParam = this.requestParam.obj;

                bodyParam = bodyParam ? $.extend({}, bodyParam) : {};
                requestParam[this.requestParam.key] = bodyParam;

                that.bodyParam = bodyParam;

                if(that.paging) {
                    pageCount = that.$gridHeader.find('.change-grid-height-select').val() || that.pageCountDefaultVal;
                    requestParam[this.requestParam.key]['pageCount'] = pageCount;

                    pageNum = (initActivePaging) ? 1 : that.$gridPaging.find('.move-btn.on').attr('data-id');
                    requestParam[this.requestParam.key]['pageNum'] = pageNum.toString();
                }

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
                    commonUtil.requestBxmAjax(requestParam,{
                        beforeSend: function() {
                            that.loadingBarAvailable && that.subViews['gridLoadingBar'].show();
                        },
                        success: function(response) {
                            that.renderData(response[that.responseParam.objKey], that.responseParam.key);
                            loadAfter && loadAfter(response[that.responseParam.objKey]);
                        },
                        complete: function() {
                            that.loadingBarAvailable && that.subViews['gridLoadingBar'].hide();
                        }
                    });
                }
            },

            renderData: function(data, key) {
                var that = this,
                    pageSize,
                    renderData = key ? data[key] : (data || []);
                that.currentPageRowCount = renderData.length;

                if (!that.currentPageRowCount && that.activeBtnId !== 1) {
                    that.moveFirstPaging();
                }

                // 그리드 데이터 로드
                that.store.loadData(renderData);

                // 그리드 페이징 렌더
                pageSize = data['totalPage'];
                (pageSize === 0) && (pageSize = 1);
                pageSize && that.renderPagingBtn(pageSize);
            },

            reloadData: function (loadAfter, initActivePaging) {
                this.loadData(this.bodyParam, loadAfter, initActivePaging);
            },

            // external use
            reloadGrid: function (loadAfter, initActivePaging) {
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
                    this.resizeGrid();
                    $gridToggleIcon.removeClass('fa-rotate-90').addClass('fa-rotate-270');
                }
            },

            changeGridHeight: function(e) {
                var $target = $(e.currentTarget);

                // change grid height
                this.setGridHeight(parseInt($target.val()));

                // load grid data
                this.reloadData(null, true);
            },

            /**
             * 지정한 행 갯수에 맞게 그리드 높이 세팅
             *
             * @param rowCount 높이를 세팅할 행 갯수
             */
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

            addData: function(data) {
                this.store.add(data);
            },

            remove: function(data) {
            	this.store.remove(data);
            },

            find: function(fieldName, value) {
            	return this.store.find(fieldName, value);
            },

            /**
             * 그리드의 데이타 모두 삭제
             */
            resetData: function() {
                this.store.removeAll();
            },

            /**
             * 그리드의 모든 데이타 리턴
             *
             * @returns {Array}
             */
            getAllData: function() {
                var dataList = [];

                this.store.each(function(record) {
                    dataList.push(record.data);
                });

                return dataList;
            },

            /**
             * 그리드의 수정된 데이타 리턴
             *
             * @returns {Array}
             */
            getModifiedData: function() {
                var dataList = [];

                this.store.getModifiedRecords().forEach(function(record) {
                    dataList.push(record.data);
                });

                return dataList;
            },

            // 페이징 처리가 되지 않으므로 loadData를 대신 사용 권장 (deprecated)
            setData: function(data) {
                this.resetData();
                this.store.loadData(data);
            },

            getLength: function() {
                return this.store.getCount();
            },

            /**
             * 특정 인덱스의 데이터 리턴
             *
             * @param index 데이터를 가져올 인덱스
             * @returns {*}
             */
            getDataAt: function(index) {
                var rawData = this.store.getAt(index);
                return rawData && rawData.data;
            },

            /**
             * 특정 인덱스에 데이터 셋팅
             *
             * @param index 데이터를 셋팅할 인덱스
             * @param data 셋팅할 데이터
             */
            setDataAt: function(index, data) {
                var storeItem = this.store.getAt(index);

                storeItem.data = data;
                storeItem.commit();
            },

            /**
             * 특정 인덱스의 데이터 삭제
             *
             * @param index 데이터를 삭제할 인덱스
             */
            removeAt: function(index) {
                this.store.removeAt(index);
            },

            commitChanges: function() {
                this.store.commitChanges();
            },

            getDataItmes: function() {
                return this.store.data.items;
            },

            changeColumns: function(columns) {
                this.grid.reconfigure(null, columns);
            },

            getSelectedItem: function() {
                var dataList = [];

                this.grid.getSelectionModel().getSelection().forEach(function(raw, i) {
                    dataList.push(raw.data);
                });

                return dataList;
            },

            getSelectedRecords: function() {
                return this.grid.getSelectionModel().getSelection();
            },

            getSelectedRowIdx: function() {
                return this.store.indexOf(this.getSelectedRecords()[0]);
            },

            setSelectedRowIdx: function(index) {
                this.grid.getSelectionModel().select(index);
            },

            insertData: function(idx, data) {
                this.store.insert(idx, data);
            },

            setDisabled: function() {
                this.$gridHeader.find('.change-grid-height-select').prop('disabled', true);
                this.$gridHeader.find('.btn-wrap>.bw-btn').prop('disabled', true);
                this.$gridPaging.find('button').prop('disabled', true);
            },

            setEnabled: function() {
                this.$gridHeader.find('.change-grid-height-select').prop('disabled', false);
                this.$gridHeader.find('.btn-wrap>.bw-btn').prop('disabled', false);
                this.$gridPaging.find('button').prop('disabled', false);
            },

            showGridLoadingBar: function() {
                this.subViews['gridLoadingBar'].show();
            },

            hideGridLoadingBar: function() {
                this.subViews['gridLoadingBar'].hide();
            },

            getPageSize: function() {
                return this.$gridHeader.find('.change-grid-height-select').val();
            },

            getPageNumber: function() {
                return  this.activeBtnId;
            },

            update: function() {
                this.store.update();
            },

            orderIndex: function(key) {
                this.store.data.items.forEach(function(item, idx){
                    item.data[key] = idx + 1;
                    item.commit();
                });
            },

            getView: function() {
                return this.grid.getView();
            }
        });

        return ExtGrid;
    }
);