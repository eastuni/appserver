/**
 * Created by yanggwi on 14. 11. 11..
 */

define(
    [
        'text!bx-component/bx-tree/bx-tree-tpl.html',
        'text!bx-component/bx-tree/bx-tree-item-tpl.html',
        'bx-component/bx-context-menu/bx-context-menu'
    ],
    function (
        tpl,
        itemTpl,
        BxContextMenu
    ) {

        var BXList = Backbone.View.extend({

            tagName: 'ul',
            className: 'bx-tree bx-tree-floor bx-tree-root',

            events: {
                'click .bx-tree-navi': 'clickItemNavi',

                'click .bx-tree-node': 'clickItemHandler',
                'dblclick .bx-tree-node': 'dblclickItemHandler',
                'contextmenu .bx-tree-node': 'contextmenuItemHandler',

                'click .bx-tree-config-btn': 'clickItemConfigHandler',

                'click .bx-tree-add-node-btn': 'addNodeHandler'
            },

            templates: {
                tpl: tpl,
                itemTpl: itemTpl
            },

            listeners: { },

            itemConfig: { },

            isDynamicLoadMode: false,

            /**
             *
             * @param config {
             *      listeners(clickItem, deleteItem, configItem),
             *      checkAble,
             *      attrs,
             *      nodeAttrs,
             *      isDynamicLoadMode,
             *      contextMenuItem { menuNameList[], menuFuncList[]}
             *      types { 'name': { id, value, children, symbol }, ...  } | [ 'name', ... ]
             *      fields { id, value, children, symbol }
             * }
             */
            initialize: function (initConfig) {
                $.extend(this, initConfig);

                if(initConfig) {
                    initConfig.attrs && this.$el.attr(initConfig.attrs);
                }
            },

            render: function() {
                this.itemConfig.viewId = this.cid;
                this.itemConfig.checkAble = this.checkAble;
                return this.$el;
            },

            renderItem: function(data) {
                var that = this;


                that.$el.html(makeTreeItem(data, 0));

                function makeTreeItem(children, parentLevel) {
                    var listHTML = [],
                        currentLevel = parentLevel,
                        addNodeButtonExclusiveLevel;

                    children.forEach(function(item) {

                        var itemData,
                            $itemHTML,
                            fields,
                            children,
                            valueList;


                        if(that.types) {
                            fields = that.types[item.treeType];
                        }else {
                            fields = that.fields;
                        }

                        itemData = {
                            id: item[fields.id],
                            value: item[fields.value],
                            type: item.treeType
                        };

                        // 이름 출력을 위해서 (name.ko) by HR
                        if(fields.value.indexOf('.') !== -1){
                            valueList = fields.value.split('.');
                            itemData.value = item[valueList[0]][valueList[1]];
                        }

                        // 히든 처리를 위해서 (값은 Y/N) by HR
                        if(fields.hidden && (item[fields.hidden.key] === fields.hidden.value.Y)) {
                            itemData.hidden = true;
                        }
                        
                        if(fields.disabled) {
                        	// disabled 처리를 위해서 (값은 Y/N) by HR
                        	if(fields.disabled && (item[fields.disabled] === 'Y')) {
                        		itemData.disabled = true;
                        	}
                        	else {
                        		itemData.disabled = false;
                        	}
                        }
                        else {
                        	itemData.disabled = true;
                        }

                        // Set Tree Node Symbol
                        if(fields.symbol) {
                            itemData.symbolName = fields.symbol.text;
                            itemData.symbolColor = fields.symbol.color;
                        }

                        // Set Child
                        children = item[fields.children || 'children'];

                        // Set is Leaf
                        if($.isArray(children)) {
                            itemData.hasChildren = children.length > 0;
                        }

                        $itemHTML = $(that.itemTpl($.extend(true, {}, that.itemConfig, itemData)));

                        // Render 적용
                        if(typeof that.renderer === 'function') {
                            $itemHTML.find('.bx-tree-node-conts').html(that.renderer(itemData, item));
                        }

                        if($.isArray(children)) {
                            $itemHTML.find('.bx-tree-floor').html(makeTreeItem(children, currentLevel + 1));
                        }

                        listHTML.push($itemHTML.data('obj', item));
                    });

                    if(that.addNodeButtonConfig && that.addNodeButtonConfig.exclusiveLevel !== currentLevel) {
                        addNodeButtonExclusiveLevel = that.addNodeButtonConfig.exclusiveLevel;
                        addNodeButtonExclusiveLevel =
                            $.isArray(addNodeButtonExclusiveLevel)?
                                addNodeButtonExclusiveLevel : [addNodeButtonExclusiveLevel];

                        if(!_.contains(addNodeButtonExclusiveLevel, currentLevel)) {
                            listHTML.push('<button class="bx-btn bx-tree-add-node-btn"><i class="fa fa-plus"></i> '+ bxMsg('cbb_items.SCRNITM#add') +'</button>');
                        }
                    }
                    return listHTML;
                }
            },

            clickItemNavi: function(e) {
                var currentItem = e.currentTarget,
                    $currentNode = $(currentItem).parent().parent();
                	
                if($currentNode.find(".bx-tree-floor li").length < 1) {
                	return;
                }
                
                if ($currentNode.attr('data-state') === 'expand') {
                    $currentNode.attr('data-state', 'collapse');
                } else {
                    $currentNode.attr('data-state', 'expand');
                }
            },

            addNode: function(parentId, newNodeData) {
                var that = this,
                    itemData,
                    $itemHTML,
                    fields,
                    valueList;

                if(that.types) {
                    fields = that.types[newNodeData.treeType];
                }else {
                    fields = that.fields;
                }

                itemData = {
                    id: newNodeData[fields.id],
                    value: newNodeData[fields.value],
                    type: newNodeData.treeType
                };

                // Set Tree Node Symbol
                if(fields.symbol) {
                    itemData.symbolName = fields.symbol.text;
                    itemData.symbolColor = fields.symbol.color;
                }
                
                itemData.disabled = true;
                
                console.log("addNode");
                
                $itemHTML = $(that.itemTpl($.extend(true, {}, that.itemConfig, itemData)));

                // Render 적용
                if(typeof that.renderer === 'function') {
                    $itemHTML.find('.bx-tree-node-conts').html(that.renderer(itemData, newNodeData));
                }

                $itemHTML.data('obj', newNodeData);

                if(parentId) {
                	if(that.$el.find('.bx-tree-floor-item[data-id=' + parentId + '] > .bx-tree-floor').find("li").length > 0) {
                		that.$el.find('.bx-tree-floor-item[data-id=' + parentId + '] > .bx-tree-floor > li:last').after($itemHTML);
                	}
                	else {
                		that.$el.find('.bx-tree-floor-item[data-id=' + parentId + '] > .bx-tree-floor').html($itemHTML);
                	}
                }
                else {
                	that.$el.find('.bx-tree-floor-item:last').after($itemHTML);
                }
            },

            addNodeHandler: function(e) {
                var parentId = $(e.currentTarget).parent().parent().attr('data-id');

                if(typeof this.addNodeButtonConfig.handler === 'function') {
                    this.addNodeButtonConfig.handler.call(this, parentId);
                }
            },

            commonHandler: function(handlerName, $item, eventTarget, e) {
                var handler = this.listeners[handlerName],
                    processDefault;

                if(typeof handler === 'function') {
                    processDefault = handler.call(this, $item.data('id'),  $item.data('obj'), eventTarget, e);
                }

                return !(processDefault === false);
            },

            clickItemHandler: function(e) {
                var $eventTarget = $(e.currentTarget),
                    $item = $eventTarget.parent();

                if(!this.commonHandler('clickItem', $item, e.currentTarget, e)) {
                    return;
                }

                // 중복 선택
                this.$el.find('.bx-tree-node.is-marked').removeClass('is-marked');
                if(!this.itemConfig.multySelectAble) {
                    this.$el.find('.bx-tree-node.is-selected').removeClass('is-selected');
                }
                
                $item.find('.bx-list-selector').prop('checked', true);

                // 토글
                if($eventTarget.hasClass('is-selected')) {
                    $eventTarget.removeClass('is-selected')
                        .find('.bx-list-selector').prop('checked', false);
                }else {
                    $eventTarget.addClass('is-selected')
                        .find('.bx-list-selector').prop('checked', true);
                }
            },

            clickItemConfigHandler: function(e) {
                var $eventTarget = e.currentTarget,
                    $item = $($eventTarget).parent();

                if(!this.commonHandler('configItem', $item, $eventTarget, e)) {
                    return;
                }
            },

            dblclickItemHandler: function(e) {
                var $eventTarget = e.currentTarget,
                    $item = $($eventTarget).parent();

                if(!this.commonHandler('dblclickItem', $item, $eventTarget, e)) {
                    return;
                }
            },

            contextmenuItemHandler: function(e) {
            	
                var $eventTarget = $(e.currentTarget),
                    $item = $($eventTarget).parent(),
                    bxContextMenu;

                if(!this.contextMenuItems) {
                    return;
                }

                bxContextMenu = new BxContextMenu({
                    menuItems: this.contextMenuItems,
                    item: $item,
                    itemId: $item.data('id'),
                    itemData: $item.data('obj'),
                    currentTarget: e.currentTarget,
                    e: e
                });

                e.preventDefault();

//                // 중복 선택
//                this.$el.find('.bx-tree-node.is-marked').removeClass('is-marked');
//                
//                if($eventTarget.hasClass('is-marked')) {
//                    $eventTarget.removeClass('is-marked');
//                }else {
//                    $eventTarget.addClass('is-marked');
//                }

                this.$el.find('.bx-tree-node.is-selected').removeClass('is-selected').find('.bx-list-selector').prop('checked', false);
            
                if($eventTarget.hasClass('is-selected')) {
                	$eventTarget.removeClass('is-selected').find('.bx-list-selector').prop('checked', false);
                }else {
                	$eventTarget.addClass('is-selected').find('.bx-list-selector').prop('checked', true);
                }

                // 컨텍스트 메뉴 show
                bxContextMenu.show();
            },

            selectItem: function(idList, isTriggerClickItem) {
            	var that = this,
            	idList = $.isArray(idList)? idList:[idList];
            	
            	that.$el.find('.bx-tree-node.is-selected').removeClass('is-selected')
            	.find('.bx-list-selector').prop('checked', false);
            	
            	idList.forEach(function(id) {
            		var $listItem = that.$el.find('.bx-tree-node').parent().filter('[data-id="'+id+'"]');
            		
            		$listItem.find('.bx-tree-node').first().addClass('is-selected')
            		.find('.bx-list-selector').prop('checked', true);
            		
            		if(isTriggerClickItem) {
            			$listItem.click();
            		}
            	});
            },

            markItem: function(idList) {
                var that = this,
                    idList = $.isArray(idList)? idList:[idList];

                that.$el.find('.bx-tree-node.is-marked').removeClass('is-marked');

                idList.forEach(function(id) {
                    var $listItem = that.$el.find('.bx-tree-node').parent().filter('[data-id="'+id+'"]');
                    $listItem.find('.bx-tree-node').addClass('is-marked');
                });
            },

            deselectedAll: function () {
                this.$el.find('.bx-tree-node.is-selected').removeClass('is-selected');
            },

            demarkedAll: function () {
                this.$el.find('.bx-tree-node.is-marked').removeClass('is-marked');
            },

            changeMode: function(mode) {
                this.$el.attr('data-mode', mode);
                this.mode = mode;
            },

            getSelectedItem: function() {
                var selectedItemData = [];

                this.$el.find('.bx-list-item.is-selected').each(function(i, item) {
                    selectedItemData.push($(item).data('obj'));
                });

                return selectedItemData;
            },

            getSelectedItemId: function() {
                var selectedItemIdData = [];

                this.$el.find('.bx-tree-node.is-selected').each(function(i, item) {
                    selectedItemIdData.push($(item).parent().attr('data-id'));
                });

                return selectedItemIdData;
            },

            getChekcedItems: function() {
                var checkedItems = [];

                this.$el.find('.bx-tree-checkbox:checked').each(function(i, item) {
                    var $node = $(item).parent(),
                        data = $node.data('obj');

                    data.id = $node.data('id');
                    checkedItems.push(data);
                });

                return checkedItems;
            },

            expandAll: function () {
                this.$el.find('[data-state]').attr('data-state', 'expand');
            },

            collapseAll: function() {
                this.$el.find('[data-state]').attr('data-state', 'collapse');
            },

            expand: function (level) {
                var rootNode = this.$el;

                for(var i=1; i<level; i++){
                    rootNode.find(' > .bx-tree-floor-item > .bx-tree-navi-wrap > .bx-tree-navi').click();
                    rootNode = rootNode.find(' > .bx-tree-floor-item > .bx-tree-floor');
                }
            }

        });

        return BXList;
    }
);