/**
 * Created by yanggwi on 14. 11. 11..
 */

define(
    [
        'text!bx-component/bx-accordion/bx-accordion-tpl.html',
        'text!bx-component/bx-accordion/bx-accordion-item-tpl.html',
        'bx-component/bx-context-menu/bx-context-menu'
        , 'bx/views/workspace'
    ],
    function (
        tpl,
        itemTpl,
        BxContextMenu
        , workspaceView
    ) {

        var BXList = Backbone.View.extend({

            events: {
                'click .bx-accordion-node': 'clickItemHandler'
                , 'dblclick .bx-accordion-node': 'dblclickItemHandler'
            	, 'contextmenu .bx-accordion-node': 'contextmenuItemHandler'
            }

            , templates: {
                tpl: tpl,
                itemTpl: itemTpl
            }

            , listeners: { }

            , itemConfig: { }

            , isDynamicLoadMode: false

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
            , initialize: function (initConfig) {
                $.extend(this, initConfig);
                var that = this;
                that.that = that;
                
                if(initConfig) {
                    initConfig.attrs && this.$el.attr(initConfig.attrs);
                }
                that.workspace = workspaceView;
                
                $("#main-menu-accordion").accordion({
            		collapsible: true
            		, active: false
            		, heightStyle: "content"
            	});
                
                // bx-accordion-node 클릭
                $("#main-menu-accordion").on('click', '.bx-accordion-node', function(event) {
                	that.clickItemHandler(event);
                });

                // bx-accordion-node 더블클릭
                $("#main-menu-accordion").on('dblclick', '.bx-accordion-node', function(event) {
                	that.dblclickItemHandler(event);
                });
                
                // li 마우스 오버
                $("#main-menu-accordion").on('hover', '.bx-accordion-node-conts', function(event) {
//                	that.hoverAccordionNodeConts(event);
                });
                
            }

            , render: function() {
                this.itemConfig.viewId = this.cid;
                this.itemConfig.checkAble = this.checkAble;
                return this.$el;
            }

            , renderItem: function(data) {
                var that = this;
                
                var $mainMenuAccordion = $("#main-menu-accordion");
                $mainMenuAccordion.html("");
                
                for(var i = 0; i < data.length; i++) {
                	var mainMenu = data[i];
                	var contents = "";
                	var h3 = "";
                	var div = "";
                	var iconNm = "";
                	if(!fn_isNull(mainMenu.iconNm)) {
                		iconNm = "bw-icon i-30 "+mainMenu.iconNm;
                	}
                	
            		h3 = "<h3 class=\"clr-bd-t\" data-id=\""+mainMenu.scrnNbr+"\" handlerArg=\""+mainMenu.handlerArg+"\"><i class=\""+iconNm+"\"></i>";
            		h3 += mainMenu.menuNm +"</h3>";
            		if($.isArray(mainMenu.children)) {
            			div = "<div><ul class=\"bw-sub bx-accordion-floor\" id=\"ui-accordion-accordion-panel-"+i+"\"></ul></div>";
            		}
            		else {
            			div = "";
            		}
                	
                	contents += h3+div;
    			
                	$mainMenuAccordion.append(contents);

                	if($.isArray(mainMenu.children)) {
                		$mainMenuAccordion.find("#ui-accordion-accordion-panel-"+i+"").html(makeTreeItem(mainMenu.children, 1, i));
                    }
                	
                	$mainMenuAccordion.accordion({
                		collapsible: true
                		, active: false
                		, heightStyle: "content"
                	});
                	
                	$mainMenuAccordion.accordion("refresh");             	
                }
                
                function makeTreeItem(children, parentLevel, target) {
                    var listHTML = [],
                    currentLevel = parentLevel;

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
                            viewValue: item[fields.value],
                            type: item.treeType,
                            currentLevel : currentLevel
                        };

                        // 이름 출력을 위해서 (name.ko) by HR
                        if(fields.value.indexOf('.') !== -1){
                            valueList = fields.value.split('.');
                            itemData.value = item[valueList[0]][valueList[1]];
                        }
                        
                        // 메뉴명이 24 가 넘으면 22 로 자르고 ... 을 붙인다.
                        if(itemData.value.length > 24) {
                        	itemData.viewValue = itemData.value.substring(0, 22)+"...";
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

                        // Set Child
                        children = item[fields.children || 'children'];

                        // Set is Leaf
                        if($.isArray(children)) {
                            itemData.hasChildren = children.length > 0;
                        }

                        $itemHTML = $(that.itemTpl($.extend(true, {}, that.itemConfig, itemData)));

                        // Render 적용
                        if(typeof that.renderer === 'function') {
                            $itemHTML.find('.bx-accordion-node-conts').html(that.renderer(itemData, item));
                        }

                        // 자식생성
                        if($.isArray(children)) {
                            $itemHTML.find('.bx-accordion-floor').html(makeTreeItem(children, currentLevel + 1));
                        }

                        listHTML.push($itemHTML.data('obj', item));
                    });

                    return listHTML;
                }
                
                
            }

            , commonHandler: function(handlerName, $item, eventTarget, e) {
                var handler = this.listeners[handlerName],
                    processDefault;

                if(typeof handler === 'function') {
                    processDefault = handler.call(this, $item.data('id'),  $item.data('obj'), eventTarget, e);
                }

                return !(processDefault === false);
            }

            , clickItemHandler: function(e) {
                var $eventTarget = $(e.currentTarget),
                    $item = $eventTarget.parent();

                if(!this.commonHandler('clickItem', $item, e.currentTarget, e)) {
                    return;
                }

                // 중복 선택
                this.$el.find('.bx-accordion-node.is-marked').removeClass('is-marked');
                if(!this.itemConfig.multySelectAble) {
                    this.$el.find('.bx-accordion-node.is-selected').removeClass('is-selected');
                }
                
                $item.find('.bx-list-selector').prop('checked', true);
                
                $(".bx-accordion-node").removeClass("is-selected");
                
                // 토글
                if($eventTarget.hasClass('is-selected')) {
                    $eventTarget.removeClass('is-selected').find('.bx-list-selector').prop('checked', false);
                    
                }else {
                    $eventTarget.addClass('is-selected').find('.bx-list-selector').prop('checked', true);
                }
            }

            , dblclickItemHandler: function(e) {
                var $eventTarget = e.currentTarget,
                    $item = $($eventTarget).parent();

                if(!this.commonHandler('dblclickItem', $item, $eventTarget, e)) {
                    return;
                }
            }

            , contextmenuItemHandler: function(e) {
            	
                var $eventTarget = $(e.currentTarget),
                    $item = $($eventTarget).parent(),
                    bxContextMenu;

                if(!that.that.contextMenuItems) {
                    return;
                }

                bxContextMenu = new BxContextMenu({
                    menuItems: that.that.contextMenuItems,
                    item: $item,
                    itemId: $item.data('id'),
                    itemData: $item.data('obj'),
                    currentTarget: e.currentTarget,
                    e: e
                });

                e.preventDefault();

                that.that.$el.find('.bx-accordion-node.is-selected').removeClass('is-selected').find('.bx-list-selector').prop('checked', false);
            
                if($eventTarget.hasClass('is-selected')) {
                	$eventTarget.removeClass('is-selected').find('.bx-list-selector').prop('checked', false);
                }else {
                	$eventTarget.addClass('is-selected').find('.bx-list-selector').prop('checked', true);
                }

                // 컨텍스트 메뉴 show
                bxContextMenu.show();
            }

            , selectItem: function(idList, isTriggerClickItem) {
                var that = this,
                    idList = $.isArray(idList)? idList:[idList];

                that.$el.find('.bx-accordion-node.is-selected').removeClass('is-selected')
                        .find('.bx-list-selector').prop('checked', false);

                idList.forEach(function(id) {
                    var $listItem = that.$el.find('.bx-accordion-node').parent().filter('[data-id="'+id+'"]');

                    $listItem.find('.bx-accordion-node').first().addClass('is-selected')
                             .find('.bx-list-selector').prop('checked', true);

                    if(isTriggerClickItem) {
                        $listItem.click();
                    }
                });
            }

            , markItem: function(idList) {
                var that = this,
                    idList = $.isArray(idList)? idList:[idList];

                that.$el.find('.bx-accordion-node.is-marked').removeClass('is-marked');

                idList.forEach(function(id) {
                    var $listItem = that.$el.find('.bx-accordion-node').parent().filter('[data-id="'+id+'"]');
                    $listItem.find('.bx-accordion-node').addClass('is-marked');
                });
            }

            , deselectedAll: function () {
                this.$el.find('.bx-accordion-node.is-selected').removeClass('is-selected');
            }

            , demarkedAll: function () {
                this.$el.find('.bx-accordion-node.is-marked').removeClass('is-marked');
            }

            , changeMode: function(mode) {
                this.$el.attr('data-mode', mode);
                this.mode = mode;
            }

            , getSelectedItem: function() {
                var selectedItemData = [];

                this.$el.find('.bx-list-item.is-selected').each(function(i, item) {
                    selectedItemData.push($(item).data('obj'));
                });

                return selectedItemData;
            }

            , getSelectedItemId: function() {
                var selectedItemIdData = [];

                this.$el.find('.bx-accordion-node.is-selected').each(function(i, item) {
                    selectedItemIdData.push($(item).parent().attr('data-id'));
                });

                return selectedItemIdData;
            }
            
        });

        return BXList;
    }
);