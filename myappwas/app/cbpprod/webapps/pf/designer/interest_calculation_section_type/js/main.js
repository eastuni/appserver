class Main {
  constructor() {
    this.tntInstId = getLoginTntInstId();
      
    // template
    this.menuTpl = getTemplate('menuTpl');

    this.repository = new InterestCalcuationRepository({
      tntInstId: getLoginTntInstId(),
      loginUserId: getLoginUserId(),
    });
    
    this.sectionConfig = new SectionConfig({
      container: '.pf-int-cal-sctn-tp',
      repository: this.repository,
    });
  }

  init() {
    this.repository.getSectionList().then((sectionList) => {
      this.sectionList = sectionList;

      $(document).ready(() => {
        $('.pf-int-cal-menu-box').html(this.menuTpl());

        const menu = new SectionMenu({
          tntInstId: this.tntInstId,
          container: '.pf-int-cal-tree',
          sectionList: this.sectionList,
          sectionConfig: this.sectionConfig,
        });
        menu.render();
      });
    });
  }
  
}

const main = new Main();
main.init();

// pf common
const $el = $('.pf-int-cal-sctn-tp');
const onEvent = PFUtil.makeEventBinder($el);
