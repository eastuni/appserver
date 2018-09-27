/**
 * @fileOverview It provides the ability to use each library component.
 * @author BankwareGlobal ProductFactory Team
 */
(function(global) {

    var PFComponent = { };

    /**
     * provides tooltip for object.
     * @param {Object} $root - jQuery Element for use tooltip in object.
     * @return {void} - show tooltip
     */
    PFComponent.toolTip = function($root) {
        $($root).on('mouseenter', '.pfui-tree-item', function (e) {
            var that = this,
                $toolTip = $('.tooltip');

            if ($(that).hasClass('pfui-tree-item-hover')) {
                var message = $(that).text();

                if($toolTip.is(':visible')) {
                    return;
                }

                $('.tooltip-message').text(message);

                $toolTip.removeAttr('style');
                $toolTip.css({top: e.pageY+15, left: e.pageX+15}).show();
            }
        }).on('mouseleave', '.pfui-tree-item', function (e) {
            var $toolTip = $('.tooltip');

            if(!$toolTip.is(':visible')) {
                return;
            }

            $toolTip.hide();
        }).on('mouseenter', '[icon-tooltip]', function (e) {
        	if($('.help-area') && $('.help-area').length > 0 && $('.help-area').css('display') != 'none') return;
            // OHS 20161101 신규추가 기존 tooltip delay때문에 추가
            var that = this,
                $toolTip = $('.tooltip');

                var message = $(that).attr('icon-tooltip');

                if($toolTip.is(':visible')) {
                    return;
                }

                $('.tooltip-message').text(message);

                $toolTip.removeAttr('style');
                $toolTip.css({top: e.pageY+15, left: e.pageX+15}).show();
                $toolTip.css('z-index', 2000);
        }).on('mouseleave', '[icon-tooltip]', function (e) {
            // OHS 20161101 신규추가 기존 tooltip delay때문에 추가
            var $toolTip = $('.tooltip');

            if(!$toolTip.is(':visible')) {
                return;
            }

            $toolTip.hide();
        })
    };

    /**
     * provides extJs Grid.
     * @param {makeExtJSConfig} config - configuration for Make extJs Grid.
     * @return {Object} - extJs Grid Object.
     */
    PFComponent.makeExtJSGrid = function(config) {
        function ExtJSGrid() {
            var that = this,
                $gridContainer,
                gridConfig,
                storeConfig;

            that.grid = null,
            that.store = null,
            that.settedParam = null,
            that.pageSize = config.pageSize || 2;
            that.currentPage = 1;
            that.lastPage = 1;
            that.requestURL,
            that.requestMethod;
            that.usePaging = config.paging;

            storeConfig = {
                fields: config.fields
            };

            that.store = Ext.create('Ext.data.Store', storeConfig);

            that.requestURL = config.url;
            that.dataRoot = config.dataRoot || null;
            that.requestMethod = config.httpMethod;

            gridConfig = {
                store: that.store,
                header: false
            };

			// OHS 2017.12.21 추가 - grid html encode 처리
            if(config.gridConfig && config.gridConfig.columns) {
            	// OHS 2018.01.22 추가 - XSS 변환처리된 데이터를 그리드에 그대로 보여주기위해 override 함.
            	Ext.override(Ext.grid.column.Column,{
            		defaultRenderer:Ext.util.Format.htmlEncode
            	});
            }

            $.extend(true, gridConfig, config.gridConfig);

            // OHS 20171215 - renderTo 에 그리드가 존재하면 다시 그리지 않음. 클릭을 여러번했을때 중복 그리드 생성 문제때문.
            if($(gridConfig.renderTo) && $(gridConfig.renderTo).length > 1) {
            	return false;
            }
            $gridContainer = $(gridConfig.renderTo);

            $gridContainer.elementReady(function() {
                var pagingFooter;

                gridConfig.renderTo = $gridContainer[0];
                gridConfig.width = $gridContainer.width();

                if(config.paging) {
                    gridConfig.height = $gridContainer.height() - 30;
                    that.$pagingFooter =
                        $(
                            '<div class="grid-paging-footer" style="text-align: center">'+
                                '<button class="grid-paging-first-btn grid-paging-btn"></button> '+
                                '<button class="grid-paging-prev-btn grid-paging-btn" style="margin-right:5px;"></button>'+
                                '<input class="grid-page-input" style="width:18px;height: 14px;text-align:center;" maxlength="3" value="1"> ' +
                                '/ <span class="grid-paging-total-page"> </span> ' +
                                '<button class="grid-paging-request-btn bw-btn" style="width:30px; height:20px; font-size:10px; padding:0; margin:0">'+ bxMsg('movePage') +'</button> '+
                                ' <button class="grid-paging-next-btn grid-paging-btn" style="width:12px;margin-left:8px"></button>'+
                                '<button class="grid-paging-last-btn grid-paging-btn"></button> '+
                                '<div style="float:right"><span>' + bxMsg('totalPage') + ' </span> ' +
                                '<span class="grid-paging-total-item"></span>' +
                                '<span> ' + bxMsg('totalGridRecord') + '</span></div>' +
                            '</div>'
                        );

                    that.$pagingFooter.on('click', '.grid-paging-first-btn', function() {
                        if(!that.settedParam) return;
                        that.currentPage = 1;
                        that.$pagingFooter.find('.grid-page-input').val(that.currentPage);
                        that.loadData();
                    });
                    that.$pagingFooter.on('click', '.grid-paging-prev-btn', function() {
                        if(!that.settedParam) return;
                        that.currentPage = (that.currentPage > 1) ? that.currentPage - 1 : 1;
                        that.$pagingFooter.find('.grid-page-input').val(that.currentPage);
                        that.loadData();
                    });
                    that.$pagingFooter.on('click', '.grid-paging-request-btn', function() {
                        if(!that.settedParam) return;
                        var pageNum = that.$pagingFooter.find('.grid-page-input').val();
                        pageNum = (pageNum > that.lastPage) ? that.lastPage : pageNum;
                        that.$pagingFooter.find('.grid-page-input').val(pageNum);
                        that.currentPage = pageNum;
                        that.loadData();
                    });
                    that.$pagingFooter.on('click', '.grid-paging-next-btn', function() {
                        if(!that.settedParam) return;
                        that.currentPage = (that.currentPage < that.lastPage) ? parseInt(that.currentPage) + 1 : that.lastPage;
                        that.$pagingFooter.find('.grid-page-input').val(that.currentPage);
                        that.loadData();
                    });
                    that.$pagingFooter.on('click', '.grid-paging-last-btn', function() {
                        if(!that.settedParam) return;
                        that.currentPage = that.lastPage;
                        that.$pagingFooter.find('.grid-page-input').val(that.currentPage);
                        that.loadData();
                    });

                }else {
                    gridConfig.height = $gridContainer.height();
                }

                that.grid = Ext.create('Ext.grid.Panel', gridConfig);
                $gridContainer.append(that.$pagingFooter);
            });

        };

        ExtJSGrid.prototype = {
            constructor: 'ExtJSGrid',

            /**
             * Get Selected Item Information
             * @return {Array} Selected Item Information List
             */
            getSelectedItem: function() {
                var dataList = [];

                this.grid.getSelectionModel().getSelection().forEach(function(raw, i) {
                    dataList.push(raw.data);
                });

                return dataList;
            },

            /**
             * Get Selected Records Information
             * @return {Array} Selected Records Information List
             */
            getSelectedRecords: function () {
                return this.grid.getSelectionModel().getSelection();
            },

            /**
             * Change Columns
             * @param {String[]} columns - change columns
             * @return {void} reload columns
             */
            changeColumns: function (columns) {
                this.grid.reconfigure(null, columns);
            },

            /**
             * Set Grid Data
             * @param {Array} data - Grid Data List
             * @return {void}
             */
            setData: function(data) {
                this.resetData();
                this.store.loadData(data);
            },

            /**
             * Reset Grid Data.
             * @return {void}
             */
            resetData: function() {
                this.store.removeAll();
                this.currentPage = 1;
                this.lastPage = 1;
                this.settedParam = null;
            },

            /**
             * Select Row By Index
             * OHS 20161028 행추가또는 행복사와같은 그리드 Row 추가를할때 추가된 행을 선택해준다.
             * @param {Number} index - Desired row index
             * @return {void}
             */
            selectRow: function(index) {
                if(index <= 0) return;
                this.grid.getSelectionModel().select(index);
            },

            /**
             * Add Grid Data
             * @param {Object} data - Add Grid Data
             * @return {void}
             */
            addData: function(data) {
                this.store.add(data);
                this.selectRow(this.store.data.length - 1);
            },

            /**
             * Copy Grid Row Data
             * 선택된 행을 복사해서 그리드에 추가한다.
             * @param {Object} - Selected for copying row data
             * @return {void}
             * @example
             * parameter : param = { key : '' , 		value : ''}
             *         ex) param = { key : 'process', 	value : 'C'}
             *             param = { key : 'isAdd'  , 	value : 'Y',
             *                       key : 'endDate' , '9999-12-31 23:59:59'}
             */
            copyRow: function(param) {
                if(this.grid.getSelectionModel().getSelection().length == 0) return;

                var selectedRecord = this.grid.getSelectionModel().getSelection()[0];
                var newData = $.extend({}, selectedRecord.data);
                newData = $.extend(newData, param);
                var index = this.store.indexOf(selectedRecord)+1;
                this.store.insert(index, newData);
                // selectRow 추가
                this.selectRow(index);
            },

            /**
             * Get All Grid Data
             * @return {Array} - All Grid Data List
             */
            getAllData: function() {
                var dataList = [];

                this.store.each(function(record) {
                    dataList.push(record.data);
                });

                return dataList;
            },

            bxmHeader : {},

            /**
             * Execute the transaction directly on the generated grid.
             * @param {Object} param - Input data.
             * @param {loadDataOption} option - Option of load data.
             * @return {void}
             */
            loadData: function(param, option) {
                var that = this,
                    httpMethod = config.httpMethod || 'get',
                    storeFn;

                if(param) {
                    that.settedParam = param;
                }else {
                    param = that.settedParam;
                }

                if(option && option.bxmHeader){
                    that.bxmHeader = option.bxmHeader;
                }else if(!option){
                    if(that.bxmHeader != {}) {
                        option = {bxmHeader: that.bxmHeader};
                    }else{
                        option = {};
                    }
                }

                if(that.usePaging && option.isReset) {
                    that.currentPage = 1;
                    that.$pagingFooter.find('.grid-page-input').val(that.currentPage);
                }

                if(that.usePaging) {
                    param.pageSize = that.pageSize;
                    param.currentPage = that.currentPage;
                }

                PFRequest[httpMethod](that.requestURL, param, {
                    beforeSend: function() {
                        typeof option.loadBefore === 'function' && option.loadBefore();
                    },
                    success: function(responseData) {
                        var data = (typeof responseData === 'string')? JSON.parse(responseData) : responseData,
                            contsData;

                        that.pagingInfo = data.pagination;

                        contsData = (that.dataRoot)? data[that.dataRoot] : data;

                        if(that.usePaging) {
                            var totalSize = that.pagingInfo.totalRecords,
                                totalPage = that.pagingInfo.pageSize,
                                recordsPerSize = totalSize / that.pagingInfo.pageSize;
                            that.lastPage = Math.floor(recordsPerSize);

                            that.lastPage = isNaN(that.lastPage) ? 0 : that.lastPage;

                            if(that.lastPage < recordsPerSize) {
                                that.lastPage++;
                            }

                            $('.grid-paging-total-page').text(that.lastPage);
                            $('.grid-paging-total-item').text(totalSize);
                        }

                        that.store.loadData(contsData);
                        typeof option.loadSuccess === 'function' && option.loadSuccess(contsData)
                    },
                    complete: function() {
                        typeof option.loadComplete === 'function' && option.loadComplete();
                    },
                    bxmHeader: option.bxmHeader
                });
            }
        };

        return new ExtJSGrid();
    };

    /**
     * provides extJs Tree Grid.
     * The functionality is identical to the existing PFComponent.makeExtJSGrid
     * @param {makeExtJSConfig} config - configuration for Make extJs Tree Grid.
     * @return {Object} - extJs Grid Object.
     */
    PFComponent.makeExtTreeGrid = function(config) {
        function ExtTreeGrid() {
            var that = this,
                $gridContainer,
                gridConfig,
                storeConfig;

            that.grid = null,
            that.store = null,
            that.pageSize = config.pageSize || 2;
            that.requestURL,
            that.requestMethod;

            storeConfig = {
                fields: config.fields
            };

            that.store = Ext.create('Ext.data.TreeStore', storeConfig);

            that.requestURL = config.url;
            that.dataRoot = config.dataRoot || null;
            that.requestMethod = config.httpMethod;

            gridConfig = {
                store: that.store,
                header: false,
                useArrows : true,
                rootVisible : false,
                sortableColumns : false
            };

            $.extend(true, gridConfig, config.gridConfig);

            $gridContainer = $(gridConfig.renderTo);

            $gridContainer.elementReady(function() {

                gridConfig.renderTo = $gridContainer[0];
                gridConfig.width = $gridContainer.width();
                gridConfig.height = $gridContainer.height();

                that.grid = Ext.create('Ext.tree.Panel', gridConfig);
            });

        };

        ExtTreeGrid.prototype = {
            constructor: 'ExtTreeGrid',

            /**
             * initialize Tree Store
             * @param {String[]} fields - Tree Fields
             * @return {void}
             */
            initStore: function(fields) {
                fields.push({name: 'leaf', convert: function (value, record) {
                    return (!record.data.children) || (record.data.children.length === 0);
                }});

                this.store = Ext.create('Ext.data.TreeStore', {fields: fields});
            },

            /**
             * Set Tree Store Root Node
             * @param {String[]} fieldData - Data for setting
             * @return {void}
             */
            setStoreRootNode: function (fieldData) {
                this.store.setRootNode({
                    expanded: true,
                    text: "My Root",
                    children: fieldData
                });
            },

            /**
             * Get Tree All Data
             * @return {Array} - All Tree Grid Data List
             */
            getAllData: function() {
                var dataList = [],
                    dataObj, rawData, dataKey;

                if(!this.store.getRootNode()) return dataList;
                makeTreeData(dataList, this.store.getRootNode().childNodes);

                function makeTreeData (dataArray, childNodes) {
                	if(childNodes) {

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
                }
                return dataList;
            },

            /**
             * Add Field
             * @param {Object} initval - Add Data
             * @return {void}
             */
            addField: function (initval) {
                if(this.getAllData().length > 0) {
                    this.store.getRootNode().appendChild(initval);
                } else {
                    this.setStoreRootNode([initval]);
                }
            },

            /**
             * Up the selected row.
             * @return {void}
             */
            upField: function () {
                var node = this.grid.getSelectionModel().lastSelected;
                if(!node) return;
                var parent = node.parentNode;
                if(!parent) return;
                var currentIdx = parent.indexOf(node);

	            if (currentIdx === 0) return;

	            parent.insertChild(currentIdx - 1, node);
            },

            /**
             * Down the selected row.
             * @return {void}
             */
            downField: function () {
                var node = this.grid.getSelectionModel().lastSelected;
                if(!node) return;
                var parent = node.parentNode;
                if(!parent) reutnr;
                var targetIdx = parent.indexOf(node) + 2;

                if ((targetIdx - 1) === parent.childNodes.length) return;

                parent.insertChild(targetIdx, node);
            },

            /**
             * Get Selected Item Information
             * @return {Array} - Selected Item
             */
            getSelectedItem: function() {
                var dataList = [];

                this.grid.getSelectionModel().getSelection().forEach(function(raw, i) {
                    dataList.push(raw.data);
                });

                return dataList;
            },

            /**
             * Expand all of the tree information
             * @return {void}
             */
            expandAll: function () {
                this.grid && this.grid.expandAll();
            },
            bxmHeader : {},

            /**
             * Execute the transaction directly on the generated tree grid.
             * @param {Object} param - Input data.
             * @param {loadDataOption} option - Option of load data.
             * @return {void}
             */
            loadData: function(param, option) {
                var that = this,
                    httpMethod = config.httpMethod || 'get',
                    storeFn;

                if(param) {
                    that.settedParam = param;
                }else {
                    param = that.settedParam;
                }

                if(option && option.bxmHeader){
                    that.bxmHeader = option.bxmHeader;
                }else if(!option){
                    if(that.bxmHeader != {}) {
                        option = {bxmHeader: that.bxmHeader};
                    }else{
                        option = {};
                    }
                }

                PFRequest[httpMethod](that.requestURL, param, {
                    beforeSend: function() {
                        typeof option.loadBefore === 'function' && option.loadBefore();
                    },
                    success: function(responseData) {
                        var data = (typeof responseData === 'string')? JSON.parse(responseData) : responseData,
                            contsData;

                        that.pagingInfo = data.pagination;

                        contsData = (that.dataRoot)? data[that.dataRoot] : data;

                        that.setStoreRootNode(contsData);
                        //that.store.loadData(contsData);
                        typeof option.loadSuccess === 'function' && option.loadSuccess(contsData)
                    },
                    complete: function() {
                        typeof option.loadComplete === 'function' && option.loadComplete();
                    },
                    bxmHeader: option.bxmHeader
                });
            }
        };
        return new ExtTreeGrid();
    };

    /**
     * Create a tag box for product search
     * 2018. 01. 04 추가: tagbox
     * @param {makeTagBox} config - Configuration for make tag box
     * @return {Object} - TagBox Object
     */
    PFComponent.makeTagBox = function(config) {
      function TagBox(config) {
        initialTags = config.initialTags || [];
        this.targetClass = config.targetClass;
        this.tags = new Map();

        let targetElements = document.getElementsByClassName(this.targetClass);
        if (targetElements.length === 0)
          throw "target unavailable.";
        this.targetElement = targetElements.item(0); // only deal with first item.

        this.onDuplicate = config.onDuplicate || this.onDuplicate;
        this.onAdd = config.onAdd || this.onAdd;
        this.onRemove = config.onRemove || this.onRemove;

        // create unordered list for tags
        let ul = document.createElement('ul');
        ul.classList.add('pf-tags');
        this.targetElement.appendChild(ul);

        initialTags.forEach((tag, i) => {
          this.add(tag);
        });

        // add text input;
        {
          let input = document.createElement('input');
          input.setAttribute('type', 'text');
          input.setAttribute('maxlength', 20); // OHS 20180228 - MaxLength 20으로 지정
          let li = document.createElement('li');
          li.appendChild(input);
          li.classList.add('tag-new');
          ul.appendChild(li);

          input.onkeydown = e => {
            switch (e.keyCode) {
            case 9:   // tab
            case 13:  // enter
            case 188: // ,
              let tag = e.target.value;
              if (tag.length !== 0) {
                if (this.tags.has(tag)) {
                  this.onDuplicate(tag);
                } else {
                  this.add(tag);
                  e.target.value = '';
                }
              }
              return false;

            case 8:   // backspace
              var prev = e.target.parentNode.previousSibling;
              if (e.target.value.length === 0 && prev !== null) {
            	  //this.tags.delete(prev.firstChild.innerText);
            	  //prev.remove();
            	  this.remove(prev.firstChild.innerText);
              }
              break;
            default :
            	  // OHS20180209 - 20자리까지 제한
            	  if(e.target.value && e.target.value.length > 19) {
            		  e.preventDefault();
            	  }
            }
          }

          input.onfocusout = e => {
              let tag = e.target.value;
              if (tag.length !== 0) {
                if (this.tags.has(tag)) {
                  this.onDuplicate(tag);
                } else {
                  this.add(tag);
                  e.target.value = '';
                }
              }
              return false;
          }
        }
      }

      TagBox.prototype = {
          constructor: TagBox,

          /**
           * Enter the tag name and hit Enter to execute it.
           * @param {String} tag - Input tag name
           * @return {void} - show tag button
           */
          add: function(tag) {
            // on duplicate
            if (this.tags.has(tag)) {
              this.onDuplicate(tag);
              return;
            }
            // OHS 20180209 추가 - 길이체크 후 메세지 출력
            if(tag && tag.length > 500) {
            	PFComponent.showMessage(bxMsg('maxHashTagLength'), 'warning');
            	return;
            }
            this.onAdd(tag);

            // create list element for tag.
            let li = document.createElement('li');

            // create span element for tag content.
            let text = document.createElement('span');
            text.innerText = tag;

            // create delete button
            let btn = document.createElement('a');
            let btnText = document.createElement('span');
            btnText.innerText = 'x';
            btn.appendChild(btnText);
            btn.onclick = ev => {
              this.remove(tag);
            };

            li.appendChild(text);
            li.appendChild(btn);
            li.classList.add('tag');

            let target = this.targetElement;
            let ul = target.firstChild;
            let input = target.getElementsByClassName('tag-new').item(0);
            ul.insertBefore(li, input);
            this.tags.set(tag, li);
          },

          /**
           * Click on the X button in the tag box
           * @param {String} tag - Input tag name
           * @return {void} - remove tag button
           */
          remove: function(tag) {
            if (this.tags.has(tag)) {
              this.onRemove(tag);
              const el = this.tags.get(tag);
              el.parentElement.removeChild(el);
              this.tags.delete(tag);
            }

            // soft halt when tag does not exist.
          },

          /**
           * Handle duplicate tag names
           * @param {String} tag - Input tag name
           * @return {void} - remove tag button
           */
          onDuplicate: function(tag) {
            let target = this.tags.get(tag);
            target.style.animationName = null;
            target.offsetHeight;
            target.style.animationName = 'blink';
          },

          onAdd: function() {
          },

          onRemove: function() {
          }
      };

      return new TagBox(config);
    };

    /**
     * Make JSON Object from jQuery Object.
     * @param {Object} $form - jQuery Object.
     * @param {makeYGFormOption} option - configuration object for make JSON object.
     * @return {Object} Form Object
     */
    PFComponent.makeYGForm = function($el, config) {

        /**
         * Constructor function from From Object
         * @return {void}
         */
        function Form() {
            var that = this;

            that.$el = $el;

            that.$el.on('change', 'select[data-form-param]', function(e) {
                var $select = $(this);
                $select.prev('.bx-form-select-view').val($select.val());
            });

            that.$el.find('[data-value-link]').each(function(i, el) {
                var $displayEl = $(this),
                    valueLink = $displayEl.attr('data-value-link'),
                    value = $displayEl.val(),
                    $targetItem;

                $targetItem = that.$el.find('[name='+valueLink+'][value='+value+']');

                if($targetItem[0].tagName === 'SELECT') {
                    $targetItem.val(value);
                }else {
                    $targetItem.prop('checked', true);
                }

            });

            if(config && config.mode) {
                that.changeMode(config.mode);
            }
        }

        Form.prototype = {
            constructor: 'Form',

            /**
             * Get Form Data
             * @param {MakeParamFromFormOption} option - configuration object for make JSON object.
             * @return {(Object|String)} JSON Object or JSON String
             */
            getData: function(option) {
                return PFUtil.makeParamFromForm(this.$el, option);
            },

            /**
             * change mode
             * @param {String} mode - change mode
             * @return {void}
             */
            changeMode: function(mode) {
                this.$el.attr('data-mode', mode);

                this.$el.find('[data-edit]').prop('disabled', true);
                this.$el.find('[data-edit~="'+mode+'"]').prop('disabled', false);

                this.$el.find('[data-view]').hide();

                (mode === 'new') && this.reset();

                this.$el.find('[data-view~="'+mode+'"]').show();
            },

            /**
             * form data clear
             * @return {void}
             */
            reset: function() {
                this.$el.find('.bx-form-item[type=text]').val('');
                //this.$el.find('.bx-form-item[type=select]').val('');
                this.$el.find('textarea.bx-form-item').val('');
                this.$el.find('.bx-form-item[type=checkbox]').prop('checked', false);
                //this.$el.find("select option:eq(0)").prop("selected", true);
                this.$el.find("select option:first-child").prop("selected", true);
            },

            /**
             * get from HTML
             * @return {void}
             */
            html: function() {
                this.$el.html();
            }
        };

        return new Form();
    };

    var zIndex = 1000; // OHS 20171215 추가 - 팝업에 팝업일경우 mask 처리를 하기 위함(전 팝업의 클릭가능 제어)
    /**
     * Make Popup
     * @param {Object} $form - jQuery Object.
     * @param {makePopupConfig} option - configuration object for make Popup
     * @return {(Object|String)} JSON Object or JSON String
     */
    PFComponent.makePopup = function(config) {
        if(writeYn == 'N' && config.buttons) {
            var buttons = config.buttons;
            config.buttons = [];
            buttons.forEach(function (el) {
                if(el.elCls.indexOf('write-btn') < 0 ){
                    config.buttons.push(el);
                }
            });
        }

        /**
         * Constructor function from makePopup Object
         * @return {void}
         */
        function PFUIPopup() {
            var that = this;
            var $popupContents = $(config.contents),
                defaultListeners = {
                    closed: function() {
                        this.remove(true);
                    	// OHS 20171215 추가 - 팝업에 팝업일경우 mask 처리를 하기 위함(전 팝업의 클릭가능 제어)
                    	if($('.pfui-ext-mask') && $('.pfui-ext-mask').length > 0) {
                    		$($('.pfui-ext-mask')[$('.pfui-ext-mask').length-1]).css('z-index', 999);
                    	}
                    	else {
                    		zIndex = 1000;
                    	}
                    },
                    show: function(e) {
                    	// OHS 20171215 추가 - 팝업에 팝업일경우 mask 처리를 하기 위함(전 팝업의 클릭가능 제어)
                    	if($('.pfui-ext-mask') && $('.pfui-ext-mask').length > 0) {
                    		$($('.pfui-ext-mask')[$('.pfui-ext-mask').length-1]).css('z-index', zIndex-1);
                    	}
                    },
                    beforeRenderUI : function(e) {
                      	// OHS 20171215 추가 - 그리드 cell 클릭을 여러번했을때 팝업이 여러번 뜨는 문제.
                    	if($(e.target.get('bodyContent')) && $(e.target.get('bodyContent'))[0].className) {
                    		if($('.' + $(e.target.get('bodyContent'))[0].className).length > 0) {
                    			return false;
                    		}
                    	}
                    }
                };

            // 팝업에 event가 없는 경우에는 생성 -> keyup 이벤트 추가를 위함.
//          if($.isPlainObject(config.contentsEvent)) {
            if(!config.contentsEvent){
            	config.contentsEvent = {};
            }

            $.each(config.contentsEvent, function(event, handler) {
                var eventAndTarget = event.split(' ');
                $popupContents.on(eventAndTarget[0], eventAndTarget[1], handler.bind(that.popup));
            });

            // for IE
            //$popupContents.on('keyup', 'input', function(evnet){
            $popupContents.on('keydown', 'input', function(evnet) {
            	// OHS 20180725 - 메인화면에서는 빈값일때도 이벤트처리를 하고있어 동일하게 맞춰줌
            	//if (event.keyCode === 13 && event.target.value != '') {
            	if (event.keyCode === 13) {

            		var eventBtn = $('.pfui-dialog .enter-save-btn');

            		// enter 저장 버튼이 있는 경우 (조회와 enter 저장 버튼을 동시에 사용할 수 없음)
            		if(eventBtn.length == 1){
            			console.debug('eventBtn');
            		}
            		// 검색버튼
            		else if(event.target.attributes['data-form-param']){
            			eventBtn = $('[data-form-param="'+event.target.attributes['data-form-param'].value+'"]').parents('.pfui-stdmod-body').find('.i-search');
            		}
            		else{
            			eventBtn = $('.'+event.target.classList[event.target.classList.length-1]).parents('.pfui-stdmod-body').find('.i-search');
            		}

            		if(eventBtn.length == 1){
            			eventBtn.click();
            		}
            	}
            });

            // 팝업에서 CUD 거래를 하는 경우에는 main 화면의 modifyFlag를 수정하면 안됨.
            // 팝업이 readOnly 인 경우에도 main 화면의 modifyFlage를 수정하면 안됨.
            // 1.정의되지 않은 경우 or 'main'으로 정의된 경우 main의 modifyFlag를 그대로 사용
            if(!config.modifyFlag || config.modifyFlag == 'main'){
            	$popupContents.on('change', '.bx-form-item', function(evnet){
	            	modifyFlag = true;
	            });
            }
            // 2.popup으로 정의된 경우 popupModifyFlag를 사용
            else if(config.modifyFlag == 'popup'){
	            $popupContents.on('change', '.bx-form-item', function(evnet){
	            	popupModifyFlag = true;
	            });
            }
            // 3.'readonly'로 정의 된 경우에는 이벤트를 추가하지 않음.
            // else if(config.modifyFlag == 'readonly'){}

            PFUI.use(['pfui/overlay'],function(Overlay){
                that.popup = new Overlay.Dialog({
                    title: config.title || 'title',
                    elCls: config.elCls || '',
                    width: config.width || 400,
                    height: config.height || 400,

                	// OHS 20171215 추가 - 팝업에 팝업일경우 mask 처리를 하기 위함(전 팝업의 클릭가능 제어)
                    mask:true, // 显示mask
                    zIndex: zIndex++,
                    maskShared:false,
                    buttons: config.buttons || [ {text: bxMsg('ButtonBottomString3'), elCls: 'button button-primary',
                        handler : function(){
                            if (typeof config.submit === 'function') {
                                config.submit();
                            }

                            this.close();
                        }}],
                    bodyContent: $popupContents,
                    listeners: $.extend(defaultListeners, config.listeners)
                });

                // OHS 20161102 추가 - 항상 popup show가 아닌, 로직상 체크후 show하기위해 추가
                if(!config.useCurrentTaskIdConfirmYn) {
                    that.popup.show();
                }
                else {
                	useCurrentTaskIdConfirm(that); // OHS 20161102 추가 - 현재 task-id를 사용할것인지 체크
                }
            });
            PFComponent.toolTip($popupContents);
        }

        PFUIPopup.prototype = {
            constructor: 'popup',
            show: function() {
                //this.popup.show();
            }
        };

        return new PFUIPopup();
    };

    /**
     * Show Message
     * @param {String} message - Message content
     * @param {String} level - Success or warning or error.
     * @param {Function} okHandler - Execute the callback function after click to OK button
     * @param {String} hideYn - jQuery Object.
     * @return {void}
     * @history - hideYn 추가, autoHide 컨트롤하기위함.
     * 			- PFUI 내부적으로 Message객체를 싱글톤처리하여 영향을 막기위함.
     */
    PFComponent.showMessage = function(message, level, okHandler, hideYn) {
        PFUI.use('pfui/overlay',function(overlay){
            // 2015.12.16 Alert -> Show로 변경
            //PFUI.Message.Alert(message , okHandler, level);
            PFUI.Message.Show({
                msg: message,
                icon: level,
                buttons: hideYn == true ? [] : [
                    {
                        text: bxMsg('Z_OK'),
                        elCls: 'button button-primary',
                        handler: function () {
                        	this.close(); // OHS 20180419 - 메세지가뜨고 그 이후에 메세지가 뜰경우 보이지 않는 문제때문에 위에서 close 처리
                            (typeof okHandler === 'function') && okHandler.call(this);
                        }
                    }
                ],
                autoHideDelay: hideYn == true ? 800 : 0,
                autoHide: hideYn == true ? true : false
            });
        });

    	if(	$('#loading-dim') ) {
    		$('#loading-dim').hide();
    	}
    };

    /**
     * Show Confirm
     * @param {String} message - Message content
     * @param {Function} okHandler - Execute the callback function after click to OK button
     * @param {Function} cancelHandler - Execute the callback function after click to cancel button
     * @return {void}
     */
    PFComponent.showConfirm = function(message, okHandler, cancelHandler) {
        PFUI.use('pfui/overlay',function(overlay) {
            PFUI.Message.Show({
                msg: message,
                icon: 'question',
                buttons: [
                    {
                        text: bxMsg('Z_OK'),
                        elCls: 'button button-primary',
                        handler: function () {
                        	this.close();
                            (typeof okHandler === 'function') && okHandler.call(this);
                        }
                    },
                    {
                        text: bxMsg('ButtonBottomString16'),
                        elCls: 'button',
                        handler: function () {
                        	this.close(); // OHS 20180419 - 메세지가뜨고 그 이후에 메세지가 뜰경우 보이지 않는 문제때문에 위에서 close 처리
                            (typeof cancelHandler === 'function') && cancelHandler.call(this);
                        }
                    }
                ]
            });
        });

    	if(	$('#loading-dim') ) {
    		$('#loading-dim').hide();
    	}
    }

    global.PFComponent = PFComponent;

})(window);

/**
 * makeExtJsGrid and makeExtJsTreeGrid Configuration
 * @typedef {Object} makeExtJSConfig
 * @property {Number} pageSize - paging size
 * @property {boolean} [paging=false] - Whether to paging
 * @property {String[]} fields - Grid fields.
 * @property {String} url - Uniform Resource Locator.
 * @property {String} dataRoot - Root Data.
 * @property {String} httpMethod - Http Method.
 * @property {Object} gridConfig - extJs Grid library Internal Configuration.
 */

/**
 * loadData Option
 * @typedef {Object} loadDataOption
 * @property {Object} bxmHeader - JSON data in headers for bxm framework transactions.
 * @property {boolean} [isReset=false] - Whether to reset grid
 * @property {Function} loadBefore - function to execute before load data.
 * @property {Function} loadSuccess - function to execute before load success.
 * @property {Function} loadComplete - function to execute before load complete.
 */

/**
 * makeTagBox Config
 * @typedef {Object} makeTagBox
 * @property {Object} initialTags - Data for creating initial tags
 * @property {boolean} targetClass - HTML element Class for creating tags
 * @property {Function} onDuplicate - function to execute handle duplicate tag names
 * @property {Function} onAdd - function to execute process when adding tag name
 * @property {Function} onRemove - function to execute process when deleting tag name
 */

/**
 * makeYGForm option
 * @typedef {Object} makeYGFormOption
 * @property {boolean} [mode=false] - Change Mode
 */

/**
 * makeParamFromForm option
 * @typedef {Object} MakeParamFromFormOption
 * @property {boolean} ignoreEmpty - Whether to assemble into a JSON Object when there is no value.
 * @property {String} dateFormat - Date format, default format is 'yyyy-MM-dd HH:mm:ss'
 * @property {boolean} isStringfy Whether or not to use JSON.stringify().
 */

/**
 * makePopup Config
 * @typedef {Object} makePopupConfig
 * @property {String[]} buttons - Popup buttons
 * @property {String} contents - Contents HTML
 * @property {function} contentsEvent - Contents Element Events
 * @property {String} title - Title name
 * @property {String} elCls - Popup Class name
 * @property {Number} width - Popup width
 * @property {Number} height - Popup height
 * @property {function} submit - submit function
 * @property {function} listeners - listenets functions
 * @property {boolean} [useCurrentTaskIdConfirmYn=false] - Whether to use the current task-id
 */