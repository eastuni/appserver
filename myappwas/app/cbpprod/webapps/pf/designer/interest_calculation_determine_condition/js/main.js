class Main {
  constructor() {
    this.tntInstId = getLoginTntInstId();
      
    // template
    this.menuTpl = getTemplate('menuTpl');

    this.repository = new InterestCalcuationRepository({
      tntInstId: getLoginTntInstId(),
      loginUserId: getLoginUserId(),
    });
    
    this.determineConditionConfig = new DetermineConditionConfig({
      container: '.pf-int-cal-dtrmn-cnd',
      repository: this.repository,
    });
  }

  init() {
    this.repository.getDetermineConditionList().then((determineConditionList) => {
      this.determineConditionList = determineConditionList;

      $(document).ready(() => {
        $('.pf-int-cal-menu-box').html(this.menuTpl());

        const menu = new DetermineConditionMenu({
          tntInstId: this.tntInstId,
          container: '.pf-int-cal-tree',
          determineConditionList: this.determineConditionList,
          determineConditionConfig: this.determineConditionConfig,
        });
        menu.render();
      });
    });
  }
  
}

const main = new Main();
main.init();

// pf common
const $el = $('.pf-int-cal-dtrmn-cnd');
const onEvent = PFUtil.makeEventBinder($el);
