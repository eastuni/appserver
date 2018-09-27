onEvent('contextmenu', '.pf-panel-body', (e) => {
  const target = e.target.className;

  if (target !== 'pf-panel-body') return;

  // 선택한 기관이 로그인한 기관코드와 다른 경우 콘텐츠그룹 신규 context menu를 보여주지 않음
  if (loginTntInstId !== tntInstId) return;

  // 콘텐츠그룹 신규 context menu
  PFUI.use(['pfui/menu'], (Menu) => {
    // 콘텐츠그룹신규 이벤트
    const createContentGroupEvent = function () {
      if (!isHaveProject()) {
        haveNotTask();
        return;
      }

      const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
      if (isNotMyTask(projectId)) {
        return;
      }

      if ($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === '') {
        selectNotTask();
        selectedYourTask();
        return;
      }

      if ($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status') === 'true') {
        selectedYourTask();
        return;
      }

      const data = {
        work: 'CREATE',
        applyStartDate: `${PFUtil.getNextDate()} 00:00:00`,
        applyEndDate: '9999-12-31 23:59:59',
      };
      renderContentGroupBasePopup(data);
    };

    if (writeYn !== 'Y') {
      return;
    }

    // 콘텐츠그룹 신규 context menu
    const classificationStructureNewContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-folder-close', bxMsg('createContentsGroup'), createContentGroupEvent), // 콘텐츠그룹 신규
      ],
    });

    const x = e.pageX;
    const y = e.pageY >= 500 ? e.pageY - (28 * 4) : e.pageY;


    classificationStructureNewContextMenu.set('xy', [x, y]);
    classificationStructureNewContextMenu.show();
  });

  return false;
});

onEvent('click', '.refresh-icon', () => {
  reloadClassificationNavTree();
  $('.pf-detail-wrap').removeClass('active');
});

onEvent('click', '.sidebar-toggler', (e) => {
  const $target = $(e.currentTarget);

  $el.toggleClass('contents-expand');

  if ($el.hasClass('contents-expand')) {
    $target.text('>');
  } else {
    $target.text('<');
  }

  setTimeout(() => {
    $('.manual-resize-component:visible').resize();
  }, 600);
});


onEvent('click', '.classification-search-btn', () => {
  const classificationName = $('.search-classification-name').val();
  loadClassificationList(classificationName);
});

onEvent('keydown.xdsoft', '.search-classification-name', (e) => {
  if (e.keyCode === '13') {
    const classificationName = $('.search-classification-name').val();
    loadClassificationList(classificationName);
  }
});

onEvent('click', '.search-classification-name', () => {
  $el.find('.classification-search-list-wrap').removeClass('active');
});

onEvent('change', '.pf-multi-entity', (e) => {
  tntInstId = $el.find('.pf-multi-entity').val(); // 기관콤보 change 시 tntInstId 변경

  $('.tab-nav-list').empty();
  $('.tab-content').empty();

  if ($(e.currentTarget).val() !== $('.login-tntInst-id').text()) {
    $($('.default-layout-task-menu').find('.your-task')[0]).attr('data-status', 'true');
    $($('.default-layout-task-menu').find('.your-task')[0]).removeClass('task-hide');
    $($('.default-layout-task-menu').find('.your-task')[0]).val('');
    $($('.default-layout-task-menu').find('.my-task-list')[0]).addClass('task-hide');
  } else {
    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
    $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
    $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected', true);
  }

  reloadClassificationNavTree();
  $el.find('.pf-info-cntnt-info-wrap').removeClass('active');
});
