(function() {
    var pages = {};

    $(document).ready(function() {
        generateExampleSource();
        controlDocument();

        // 초기페이지
        $('li[data-link=button] a').click();
    });


    function controlDocument() {
        var $menu = $('#bx-ui-doc-menu'),
            $main = $('#bx-ui-doc-main');

        $menu.on('click', 'a', function() {
            var $li = $(this).parent(),
                pageId = $li.attr('data-link'),
                pagePath = 'example-page/'+ pageId + '.html';

            $menu.find('li[data-state=is-active]').attr('data-state', 'is-none');
            $li.attr('data-state', 'is-active');

            if(pages[pageId]) {
                $main.html(pages[pageId]);
                bxuiLayout.layout.arrange();
                generateExampleSource();
            }else {
                $.get(pagePath, function(page) {
                    pages[pageId] = page;
                    $main.html(page);
                    bxuiLayout.layout.arrange();
                    generateExampleSource();
                });
            }
        });
    }

    function loadPage() {
        var $li = $(this).parent(),
            pageId = $li.attr('data-link'),
            pagePath = 'example-page/'+ pageId + '.html';

        $menu.find('li[data-state=is-active]').attr('data-state', 'is-none');
        $li.attr('data-state', 'is-active');

        if(pages[pageId]) {
            $main.html(pages[pageId]);
            generateExampleSource();
        }else {
            $.get(pagePath, function(page) {
                pages[pageId] = page;
                $main.html(page);
                generateExampleSource();
            });
        }
    }

    function generateExampleSource() {
        $('.component-example').each(function(idx, elem) {
            var $this = $(elem),
                code = $this.html();

            $this.after('<pre><code class="xml">'+ escapeHtml(code) +'</code></pre>');

            $('pre code').each(function(i, e) {
                hljs.highlightBlock(e);
            });

            function escapeHtml(string) {
                var entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': '&quot;',
                    "'": '&#39;',
                    "/": '&#x2F;'
                };

                return String(string).replace(/[&<>"'\/]/g, function (s) {
                    return entityMap[s];
                });
            }

        });
    }
})();


