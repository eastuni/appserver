package bankware.corebanking.deposit.simulation.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParm;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParmMngr;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.applicationcommon.enums.InstParamEnum;
import bankware.corebanking.deposit.simulation.service.dto.DpstAccrualTrgtSrvIO;
import bankware.corebanking.dto.DummyIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;


/**
 * This service sample program provides common code management function.
 * It consists of inquiry, register, modify, delete function.
 *
 * Author		Youngeun Choi
 * History
 * 2016.03.02	initial version for 3.0
 */
@BxmService("ProvisionalSettlementSvc")
@BxmCategory(logicalName="Provisional Settlement Center-Cut", description="Provisional Settlement Center-Cut")
@CbbClassInfo(classType={"SERVICE"})
public class ProvisionalSettlementSvc {


    final Logger logger = LoggerFactory.getLogger(this.getClass());


    private ArrMngr				arrMngr;
    private CmnContext			cmnContext;
    private DpstIntCalculator	dpstIntCalculator;
    private InstParmMngr        instParmMngr;


    @BxmServiceOperation("provisionalSettlementCenterCut")
    @CbbSrvcInfo(srvcCd="SDP0220402", srvcNm="provisional settlement CenterCut", srvcAbrvtnNm="prvsnlStlmntCenterCut")
    public DummyIO provisionalSettlementCenterCut(DpstAccrualTrgtSrvIO in) throws BizApplicationException {


        Arr arr = _getArrMngr().getArr(in.getArrId());
        String baseDt = StringUtils.isEmpty(in.getBaseDt()) ? _getCmnContext().getTxDate() : in.getBaseDt();

        boolean isAccrualBasis = false;
        InstParm instParm = _getInstParmMngr().getInstParm(arr.getInstCd(), InstParamEnum.ACCRUAL_BASIS_YN.getValue());
        if (instParm != null && !StringUtils.isEmpty(instParm.getParmValue()) && instParm.getParmValue().equals(CCM01.YES))
            isAccrualBasis = true;

        _getDpstIntCalculator().calculateInterestProvisionalSettlement(arr, baseDt, null, (isAccrualBasis) ? false : true);
        
        return new DummyIO();
    }






    /**
     * @return the arrMngr
     */
    private ArrMngr _getArrMngr() {
        if (arrMngr == null) {
            arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
        }
        return arrMngr;
    }


    /**
     * @return the cmnContext
     */
    private CmnContext _getCmnContext() {
        if (cmnContext == null) {
            cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
        }
        return cmnContext;
    }

    /**
     * @return the instParmMgmt
     */
    private InstParmMngr _getInstParmMngr() {
        if (instParmMngr == null) {
            instParmMngr = (InstParmMngr) CbbApplicationContext.getBean(
                    InstParmMngr.class, instParmMngr);
        }
        return instParmMngr;
    }

    /**
     * @return the intCalculatorDpst
     */
    private DpstIntCalculator _getDpstIntCalculator() {
        if (dpstIntCalculator == null) {
            dpstIntCalculator = (DpstIntCalculator) CbbApplicationContext.getBean(
                    DpstIntCalculator.class, dpstIntCalculator);
        }
        return dpstIntCalculator;
    }
}
