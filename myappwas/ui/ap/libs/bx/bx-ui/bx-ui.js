var bxui = (function() {

    var init = function (workspaceSelector) {
        var $workspace = $(workspaceSelector);

        if($workspace.length === 0) {
            throw workspaceSelector + " 셀렉터로 워크스페이스를 찾을 수 없습니다."
        }

        bindTabPanelEvent($workspace);
        bindTreeEvent($workspace);
        bindAccordionNavEvent($workspace);

    };

    function bindTabPanelEvent($workspace) {

        $workspace.on('click', '.bx-tab-menu-item', function() {

            var $clickedTab, $targetPage, pageLink;

            $clickedTab = $(this);
            pageLink = $clickedTab.attr('data-link');
            $targetPage = $('.bx-tab-page[data-link='+ pageLink +']');

            $clickedTab.siblings('.bx-tab-menu-item[data-state=active]').attr('data-state', 'none');
            $targetPage.siblings('.bx-tab-page[data-state=active]').attr('data-state', 'none');

            $clickedTab.attr('data-state', 'active');
            $targetPage.attr('data-state', 'active');
        });
    }

    function bindTreeEvent($workspace) {

        $workspace.on('click', '.bx-tree-navi', function() {

            var $treeFloorItem = $(this).parent(),
                state = $treeFloorItem.attr('data-state');

            if(state === 'expand') {
                $treeFloorItem.attr('data-state', 'collapse');
            }else if(state === 'collapse') {
                $treeFloorItem.attr('data-state', 'expand');
            }
        });

    }

    function bindAccordionNavEvent($workspace) {

        $workspace.on('click', '.bx-accordion-navi .bx-navi-cont', function(e) {

            var $this = $(e.currentTarget),
                $subNav = $this.next();

            if($this.attr('data-state') === 'open') {
                $this.attr('data-state', 'close');
                $subNav.slideUp('fast');
            }else {
                $this.attr('data-state', 'open');
                $subNav.slideDown('fast');
            }
        });
    }

    return {
        init: init
    };

})();






