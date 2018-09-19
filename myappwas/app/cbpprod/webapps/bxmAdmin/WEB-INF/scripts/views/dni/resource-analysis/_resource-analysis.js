define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/dni/resource-analysis/_resource-analysis-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        ExtTreeGrid,
        LoadingBar,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'searchApplicationTree',
                'enter-component .bxm-search-wrap input': 'searchApplicationTree',

                'change select[data-form-param="bxmAppId"]': 'loadApplicationTree',
                'click .tree-item': 'loadApplicationTree',
                'click .class-item': 'loadClassDetail',

                'click .first-tab': 'loadCallerList',
                'click .second-tab': 'clickSecondTab',
                'click .last-tab': 'clickLastTab',

                'change .caller-header select': 'loadCallerList',
                'change .callee-header select': 'loadCalleeList'
            },

            bxmAppId: null,
            pkgNm: null,
            classNm: null,
            activeTab: 'first-tab',
            params: {},

            callerChildrenRendering: false,
            calleeChildrenRendering: false,

            calleeListRendered: false,
            rootServiceListRendered: false,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['treeLoadingBar'] = new LoadingBar();

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ResourceAnalyzeService', 'getMethodList', 'ResMethodInOMM'),
                        key: 'ResMethodInOMM'
                    },
                    responseParam: {
                        objKey: 'ResMethodListOMM',
                        key: 'methodList'
                    },
                    header: {
                        content: [
                            '<h3 class="bw-desc d-block bxm-grid-title"></h3>'
                        ],
                        gridToggle: true
                    },
                    fields: ['methodId', 'methodNm', 'inputType', 'outputType',  'methodExecTypeCd', 'methodSign', 'bxmAppId', 'opNm'],
                    columns: [
                        {
                            text: bxMsg('dni.method-nm'), flex: 1, dataIndex: 'methodNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                switch (record.record.raw.methodExecTypeCd) {
                                    case '1':
                                        return '<i class="bw-sign s-so">SO</i>' + value;
                                    case '2':
                                        return '<i class="bw-sign s-bo">BO</i>' + value;
                                    case '3':
                                        return '<i class="bw-sign s-db">DB</i>' + value;
                                    case '4':
                                        return '<i class="bw-sign s-omm">OMM</i>' + value;
                                    default:
                                        return '<i class="bw-sign s-etc">ETC</i>' + value;
                                }
                            }
                        },
                        {text: bxMsg('dni.input-type'), flex: 1, dataIndex: 'inputType', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 1, dataIndex: 'outputType', align: 'center'}
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.params = {
                                methodId: record.get('methodId'),
                                methodNm: record.get('methodNm'),
                                inputType: record.get('inputType'),
                                outputType: record.get('outputType'),
                                methodExecTypeCd: record.get('methodExecTypeCd'),
                                methodSign : record.get('methodSign'),
                                bxmAppId: record.get('bxmAppId'),
                                opNm: record.get('opNm')
                            };
                            that.loadMethodDetail();
                        }
                    }
                });

                that.callerGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ResourceAnalyzeService', 'getCallerList', 'ResCallerOMM'),
                        key: 'ResCallerOMM'
                    },
                    responseParam: {
                        objKey: 'ResCallerListOMM',
                        key: 'callerList'
                    },
                    header: {
                        content: [
                            '<div class="caller-callee-header caller-header"><ul class="clr"><li class="f-l w-40"><div class="input-wrap clr">\
                    <select class="bw-input ipt-select w-100" data-form-param="isUsedOtherApp">\
                    <option value="true">' + bxMsg('dni.all-app-included') + '</option>\
                    <option value="false">' + bxMsg('dni.current-app-only') + '</option>\
                    </select>\
                    </div></li>\
                    <li class="f-l w-40"><div class="input-wrap clr">\
                    <select class="bw-input ipt-select w-100" data-form-param="isUsedSvcToSvc">\
                    <option value="true">' + bxMsg('dni.service-to-service-call-included') + '</option>\
                    <option value="false">' + bxMsg('dni.service-to-service-call-excluded') + '</option>\
                    </select>\
                    </div></li></ul></div>'
                        ],
                        gridToggle: true
                    },

                    fields: ['methodId', 'methodNm', 'classNm', 'callerMethodLine', 'inputType', 'outputType', 'pkgNm', 'methodSign', 'methodExecTypeCd', 'opNm', 'existChildren'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('dni.method-nm'), flex: 4, dataIndex: 'methodNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, metaData, record) {
                                if (record.get('existChildren')) {
                                    metaData.tdCls += ' has-children';
                                }

                                switch (record.get('methodExecTypeCd')) {
                                    case '1':
                                        return '<i class="bw-sign s-so">SO</i>' + value;
                                    case '2':
                                        return '<i class="bw-sign s-bo">BO</i>' + value;
                                    case '3':
                                        return '<i class="bw-sign s-db">DB</i>' + value;
                                    case '4':
                                        return '<i class="bw-sign s-omm">OMM</i>' + value;
                                    default:
                                        return '<i class="bw-sign s-etc">ETC</i>' + value;
                                }
                            }
                        },
                        {text: bxMsg('dni.class-nm'), flex: 3, dataIndex: 'classNm', align: 'center'},
                        {text: bxMsg('dni.caller-line'), flex: 2, dataIndex: 'callerMethodLine', align: 'center'},
                        {text: bxMsg('dni.input-type'), flex: 2, dataIndex: 'inputType', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 2, dataIndex: 'outputType', align: 'center'}
                    ],
                    listeners: {
                        beforeitemdblclick: function () {
                            return false;
                        },
                        itemexpand: function (_this, record) {
                            setTimeout(function () {
                                that.callerChildrenRendering = false;
                            }, 500)
                        },
                        itemcollapse: function (_this, record) {
                            setTimeout(function () {
                                that.callerChildrenRendering = false;
                            }, 500)
                        },
                        itemclick: function (_this, record) {
                            if (that.callerChildrenRendering || !record.get('existChildren')) return;
                            that.callerChildrenRendering = true;

                            if (record.isExpanded()) {
                                record.collapse();
                            } else {
                                // children이 있는 데 한번도 expand 한 적이 없을 때
                                if (record.isLeaf()) {
                                    that.loadCallerChildren({
                                        methodId: record.get('methodId'),
                                        calleeBxmAppId: that.bxmAppId,
                                        calleePkgNm: record.get('pkgNm'),
                                        calleeClassNm: record.get('classNm'),
                                        calleeMethodSign: record.get('methodSign'),
                                        methodExecTypeCd: record.get('methodExecTypeCd'),
                                        opNm: that.params.opNm,

                                        bxmAppId: that.bxmAppId
                                    }, function (data) {
                                        record.appendChild(data);
                                        record.data.leaf = false;
                                        record.commit();
                                        record.expand();
                                        that.renderDummyExpander(that.$callerGridWrap);
                                    });
                                    return;
                                } else {
                                    record.expand();
                                }
                            }

                            that.renderDummyExpander(that.$callerGridWrap);
                        }
                    }
                });

                that.calleeGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ResourceAnalyzeService', 'getCalleeList', 'ResCalleeOMM'),
                        key: 'ResCalleeOMM'
                    },
                    responseParam: {
                        objKey: 'ResCalleeListOMM',
                        key: 'calleeList'
                    },
                    header: {
                        content: [
                            '<div class="caller-callee-header callee-header"><ul class="clr"><li class="f-l w-40"><div class="input-wrap clr">\
                    <select class="bw-input ipt-select w-100" data-form-param="isUsedOtherApp">\
                    <option value="true">' + bxMsg('dni.all-app-included') + '</option>\
                    <option value="false">' + bxMsg('dni.current-app-only') + '</option>\
                    </select>\
                    </div></li>\
                    <li class="f-l w-40"><div class="input-wrap clr">\
                    <select class="bw-input ipt-select w-100" data-form-param="isUsedSvcToSvc">\
                    <option value="true">' + bxMsg('dni.service-to-service-call-included') + '</option>\
                    <option value="false">' + bxMsg('dni.service-to-service-call-excluded') + '</option>\
                    </select>\
                    </div></li></ul></div>'
                        ],
                        gridToggle: true
                    },

                    fields: ['methodId', 'methodNm', 'classNm', 'callerMethodLine', 'inputType', 'outputType', 'methodExecTypeCd', 'existChildren'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('dni.method-nm'), flex: 4, dataIndex: 'methodNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, metaData, record) {
                                if (record.get('existChildren')) {
                                    metaData.tdCls += ' has-children';
                                }

                                switch (record.get('methodExecTypeCd')) {
                                    case '1':
                                        return '<i class="bw-sign s-so">SO</i>' + value;
                                    case '2':
                                        return '<i class="bw-sign s-bo">BO</i>' + value;
                                    case '3':
                                        return '<i class="bw-sign s-db">DB</i>' + value;
                                    case '4':
                                        return '<i class="bw-sign s-omm">OMM</i>' + value;
                                    default:
                                        return '<i class="bw-sign s-etc">ETC</i>' + value;
                                }
                            }
                        },
                        {text: bxMsg('dni.class-nm'), flex: 3, dataIndex: 'classNm', align: 'center'},
                        {text: bxMsg('dni.caller-line'), flex: 2, dataIndex: 'callerMethodLine', align: 'center'},
                        {text: bxMsg('dni.input-type'), flex: 2, dataIndex: 'inputType', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 2, dataIndex: 'outputType', align: 'center'}
                    ],
                    listeners: {
                        beforeitemdblclick: function () {
                            return false;
                        },
                        itemexpand: function (_this, record) {
                            setTimeout(function () {
                                that.calleeChildrenRendering = false;
                            }, 500)
                        },
                        itemcollapse: function (_this, record) {
                            setTimeout(function () {
                                that.calleeChildrenRendering = false;
                            }, 500)
                        },
                        itemclick: function (_this, record) {
                            if (that.calleeChildrenRendering || !record.get('existChildren')) return;
                            that.calleeChildrenRendering = true;

                            if (record.isExpanded()) {
                                record.collapse();
                            } else {
                                // children이 있는 데 한번도 expand 한 적이 없을 때
                                if (record.isLeaf()) {
                                    that.loadCalleeChildren({
                                        methodId: record.get('methodId'),
                                        methodExecTypeCd: record.get('methodExecTypeCd'),

                                        bxmAppId: that.bxmAppId
                                    }, function (data) {
                                        record.appendChild(data);
                                        record.data.leaf = false;
                                        record.commit();
                                        record.expand();
                                        that.renderDummyExpander(that.$calleeGridWrap);
                                    });
                                    return;
                                } else {
                                    record.expand();
                                }
                            }

                            that.renderDummyExpander(that.$calleeGridWrap);
                        }
                    }
                });

                that.rootServiceGrid = new ExtGrid({
                    requestParam: {
                    	 // deferred로 가공된 데이터 조회
//                        obj: commonUtil.getBxmReqData('ResourceAnalyzeService', 'getRootService', 'ResRootServiceInOMM'),
                    	 // 직접 데이터 가공 후 조회
                        obj: commonUtil.getBxmReqData('RootSvcService', 'getRootSvcList', 'ResRootServiceInOMM'),
                        key: 'ResRootServiceInOMM'
                    },
                    responseParam: {
                        objKey: 'ResRootServiceListOMM',
                        key: 'rootSvcList'
                    },

                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['bxmAppId', 'svcNm', 'opNm', 'inputType', 'outputType', 'methodExecTypeCd'],
                    columns: [
                        {
                            text: bxMsg('dni.app-nm'), flex: 3, dataIndex: 'bxmAppId', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, metaData, record) {
                                switch (record.get('methodExecTypeCd')) {
                                    case '1':
                                        return '<i class="bw-sign s-so">SO</i>' + value;
                                    case '2':
                                        return '<i class="bw-sign s-bo">BO</i>' + value;
                                    case '3':
                                        return '<i class="bw-sign s-db">DB</i>' + value;
                                    case '4':
                                        return '<i class="bw-sign s-omm">OMM</i>' + value;
                                    default:
                                        return '<i class="bw-sign s-etc">ETC</i>' + value;
                                }
                            }
                        },
                        {text: bxMsg('dni.service-nm'), flex: 3, dataIndex: 'svcNm', align: 'center'},
                        {text: bxMsg('dni.operation-nm'), flex: 3, dataIndex: 'opNm', align: 'center'},
                        {text: bxMsg('dni.input-type'), flex: 2, dataIndex: 'inputType', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 2, dataIndex: 'outputType', align: 'center'}
                    ]
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$treeWrap = that.$el.find('.bxm-tree-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$callerGridWrap = that.$el.find('.caller-grid-wrap');
                that.$calleeGridWrap = that.$el.find('.callee-grid-wrap');
                that.$rootGridWrap = that.$el.find('.root-grid-wrap');

                // tab menu 전환 기능
                that.$el.find(".tab-title li").click(function () {
                    that.$el.find(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    that.$el.find(".tabs").hide();
                    that.activeTab = $(this).attr("rel");
                    that.$el.find("#resource-analysis-" + that.activeTab).show();
                });
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render());
                that.$callerGridWrap.html(that.callerGrid.render());
                that.$treeWrap.append(that.subViews['treeLoadingBar'].render());

                that.loadApplicationList();

                return that.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this;

                if(pageRenderInfo && pageRenderInfo.sqlId) {
                    that.bxmAppId = pageRenderInfo.bxmAppId;
                    that.pkgNm = pageRenderInfo.pkgNm;
                    that.classNm = pageRenderInfo.classNm;

                    that.loadClassDetail(null, function (response) {
                        response.methodList.forEach(function (method) {
                            if (method.methodNm === pageRenderInfo.sqlId) {
                                that.params = {
                                    methodId: method.methodId,
                                    methodNm: method.methodNm,
                                    inputType: method.inputType,
                                    outputType: method.outputType,
                                    methodExecTypeCd: method.methodExecTypeCd,
                                    methodSign: method.methodSign
                                };

                                that.loadCallerList();
                            }
                        })
                    });
                }
            },

            renderDummyExpander: function (dummyExpandTarget) {
                dummyExpandTarget.find('.has-children div').each(function (i, item) {
                    $(item).children('img:eq(-2)').addClass('x-tree-expander');
                });
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param="keyword"]').val('');
            },

            loadApplicationList: function () {
                var that = this;

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ResourceAnalyzeService', 'getAppList', 'EmptyOMM'), {
                    success: function(response) {
                        that.$searchWrap.find('select[data-form-param="bxmAppId"]')
                            .html(commonUtil.getCommonCodeOptionTag(response.ResAppListOMM.appList, true, bxMsg('dni.application-select')));
                    }
                });
            },

            searchApplicationTree: function () {
                var that = this,
                    $target = that.$treeWrap,
                    formParams = commonUtil.makeParamFromForm(that.$searchWrap),
                    operation,
                    params;
                if (!formParams.bxmAppId) {
                    swal({type: 'warning', title: '', text: bxMsg('dni.app-not-select-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
                if (!formParams.keyword) {
                    that.loadApplicationTree();
                    return;
                }

                if (formParams.searchType === 'package') {
                    operation = 'searchPackage';
                    params = {
                        bxmAppId: that.bxmAppId = formParams.bxmAppId,
                        pkgNm: formParams.keyword
                    }
                } else {
                    operation = 'searchClass';
                    params = {
                        bxmAppId: that.bxmAppId = formParams.bxmAppId,
                        classNm: formParams.keyword
                    }
                }

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ResourceAnalyzeService', operation, 'ResTreeListInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.subViews['treeLoadingBar'].show();
                    },
                    success: function(response) {
                        $target.html(renderRecursiveTree(response.ResSearchListOMM.packageList));
                    },
                    complete: function() {
                        that.subViews['treeLoadingBar'].hide();
                    }
                });

                function renderRecursiveTree(itemArray, pkgNm) {
                    var target = [];
                    itemArray && itemArray.forEach(function(item) {
                        if (item.packageNm) {
                            var packageNm = item.packageNm,
                                fullPackageNm = pkgNm ? pkgNm + '.' + packageNm : packageNm;
                            target.push(
                                '<li class="tree-item">' +
                                '<i class="fa fa-plus-square-o"></i>' +
                                '<i class="bw-icon i-15 i-tree-pkg"></i>' +
                                '<span>'+ packageNm + '</span>' +
                                '<ul class="bw-tree bw-tree-floor" data-value="'+ fullPackageNm + '">' +
                                renderRecursiveTree(item.children, fullPackageNm) + '</ul></li>')
                        } else {
                            var classNm = item.classNm;
                            target.push(
                                '<li class="class-item" data-pkg="' + pkgNm + '" data-value="'+ classNm + '">' +
                                '<i class="fa"></i>' +
                                '<i class="bw-icon i-15 i-tree-class"></i>' +
                                '<span>'+ classNm + '</span></li>')
                        }
                    });

                    return target.join('');
                }
            },

            loadApplicationTree: function (e) {
                e && e.stopPropagation();

                var that = this,
                    $target = e && e.type === 'click' ? $(e.currentTarget).find('ul') : that.$treeWrap,
                    pkgNm = $target.attr('data-value'),
                    params = commonUtil.makeParamFromForm(that.$searchWrap);

                // 서브클래스가 없는 게 확인된 경우 바로 리턴
                if (e && $(e.currentTarget).children('ul').hasClass('no-sub-class')) return;

                // 이미 확장된 트리를 다시 누르면 트리를 닫음
                if (e && e.type !== 'change' && $target.children().length) {
                    $target.html([]).siblings('.fa').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                    return;
                }

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ResourceAnalyzeService', 'getResTreeList', 'ResTreeListInOMM',
                    {
                        bxmAppId: that.bxmAppId = params.bxmAppId,
                        pkgNm: pkgNm
                    }
                ), {
                    beforeSend: function() {
                        that.subViews['treeLoadingBar'].show();
                    },
                    success: function(response) {
                        var resTreeListOMM = response.ResTreeListOMM,
                            treeList = [];

                        resTreeListOMM.treeList.forEach(function(value) {
                            treeList.push(
                                '<li class="tree-item">' +
                                '<i class="fa fa-plus-square-o"></i>' +
                                '<i class="bw-icon i-15 i-tree-pkg"></i>' +
                                '<span>'+ value + '</span>' +
                                '<ul class="bw-tree bw-tree-floor" data-value="'+ (pkgNm ? pkgNm + '.' + value : value) + '"></ul></li>')
                        });
                        resTreeListOMM.classList.forEach(function(value) {
                            treeList.push(
                                '<li class="class-item" data-pkg="' + pkgNm + '" data-value="'+ value + '">' +
                                '<i class="fa"></i>' +
                                '<i class="bw-icon i-15 i-tree-class"></i>' +
                                '<span>'+ value + '</span></li>')
                        });

                        if (treeList.length) {
                            $target.html(treeList).siblings('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                        } else {
                            $target.addClass('no-sub-class');
                            $target.siblings('.fa').removeClass('fa-plus-square-o');
                        }
                    },
                    complete: function() {
                        that.subViews['treeLoadingBar'].hide();
                    }
                });
            },

            loadClassDetail: function (e, callback) {
                var that = this;

                if (e) {
                    e.stopPropagation();
                    var $target = $(e.currentTarget),
                        params = commonUtil.makeParamFromForm(that.$searchWrap);
                    that.bxmAppId = params.bxmAppId;
                    that.pkgNm = $target.attr('data-pkg');
                    that.classNm = $target.attr('data-value');
                }

                that.grid.loadData({
                    bxmAppId: that.bxmAppId,
                    pkgNm: that.pkgNm,
                    classNm: that.classNm
                }, function (response) {
                    that.$el.find('.bxm-grid-title').text(that.pkgNm + '.' + that.classNm);
                    callback && callback(response);
                });
            },

            loadMethodDetail: function () {
                switch (this.activeTab) {
                    case 'first-tab':
                        this.loadCallerList();
                        break;
                    case 'second-tab':
                        this.loadCalleeList();
                        break;
                    case 'last-tab':
                        this.loadRootServiceList();
                        break;
                    default:
                }
            },

            loadCallerList: function () {
                if (!this.bxmAppId) return;

                var that = this,
                    formParams = commonUtil.makeParamFromForm(that.$callerGridWrap.find('.caller-header')),
                    params = {
                        methodId: that.params.methodId,
                        methodNm: that.params.methodNm,
                        inputType: that.params.inputType,
                        outputType: that.params.outputType,
                        methodExecTypeCd: that.params.methodExecTypeCd,
                        calleeBxmAppId: that.bxmAppId,
                        calleePkgNm: that.pkgNm,
                        calleeClassNm: that.classNm,
                        calleeMethodSign: that.params.methodSign,
                        opNm: that.params.opNm,

                        bxmAppId: that.bxmAppId,
                        isUsedOtherApp: formParams.isUsedOtherApp === 'true',
                        isUsedSvcToSvc: formParams.isUsedSvcToSvc === 'true'
                    };

                that.callerGrid.loadData(params, function () {
                    that.renderDummyExpander(that.$callerGridWrap);
                });
            },

            loadCallerChildren: function (params, callback) {
                var that = this,
                    formParams = commonUtil.makeParamFromForm(that.$callerGridWrap.find('.caller-header'));
                $.extend(params, {
                        isUsedOtherApp: formParams.isUsedOtherApp === 'true',
                        isUsedSvcToSvc: formParams.isUsedSvcToSvc === 'true'
                    });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ResourceAnalyzeService', 'getCallerChildren', 'ResCallerOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.callerGrid.subViews['gridLoadingBar'].show();
                    },
                    success: function(response) {
                        callback && callback(response.ResCallerListOMM.callerList);
                    },
                    complete: function() {
                        that.callerGrid.subViews['gridLoadingBar'].hide();
                    }
                });
            },

            loadCalleeList: function () {
                if (!this.bxmAppId) return;

                var that = this,
                    formParams = commonUtil.makeParamFromForm(that.$calleeGridWrap.find('.callee-header')),
                    params = {
                        methodId: that.params.methodId,
                        methodNm: that.params.methodNm,
                        classNm: that.classNm,
                        methodExecTypeCd: that.params.methodExecTypeCd,
                        inputType: that.params.inputType,
                        outputType: that.params.outputType,

                        bxmAppId: that.bxmAppId,
                        isUsedOtherApp: formParams.isUsedOtherApp === 'true',
                        isUsedSvcToSvc: formParams.isUsedSvcToSvc === 'true'
                    };

                that.calleeGrid.loadData(params, function () {
                    that.renderDummyExpander(that.$calleeGridWrap);
                });
            },

            loadCalleeChildren: function (params, callback) {
                var that = this,
                    formParams = commonUtil.makeParamFromForm(that.$calleeGridWrap.find('.callee-header'));
                $.extend(params, {
                    isUsedOtherApp: formParams.isUsedOtherApp === 'true',
                    isUsedSvcToSvc: formParams.isUsedSvcToSvc === 'true'
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ResourceAnalyzeService', 'getCalleeChildren', 'ResCalleeOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.calleeGrid.subViews['gridLoadingBar'].show();
                    },
                    success: function(response) {
                        callback && callback(response.ResCalleeListOMM.calleeList)
                    },
                    complete: function() {
                        that.calleeGrid.subViews['gridLoadingBar'].hide();
                    }
                });
            },

            loadRootServiceList: function () {
                if (!this.params || !this.params.methodId) return;

                this.rootServiceGrid.loadData({methodId: this.params.methodId});
            },

            clickSecondTab: function () {
                var that = this;
                if (!that.calleeListRendered) {
                    that.$calleeGridWrap.html(that.calleeGrid.render(function () {
                        that.calleeListRendered = true;
                        that.loadCalleeList();
                    }));
                } else {
                    that.loadCalleeList();
                }
            },

            clickLastTab: function () {
                var that = this;
                if (!that.rootServiceListRendered) {
                    that.$rootGridWrap.html(that.rootServiceGrid.render(function () {
                        that.rootServiceListRendered = true;
                        that.loadRootServiceList();
                    }));
                } else {
                    that.loadRootServiceList();
                }
            }
        });
    }
);