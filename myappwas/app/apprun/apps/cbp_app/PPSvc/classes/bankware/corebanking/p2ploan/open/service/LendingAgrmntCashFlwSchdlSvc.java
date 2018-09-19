package bankware.corebanking.p2ploan.open.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrP2pMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.loan.query.service.dto.AcctRpymntSchdldOut;
import bankware.corebanking.p2ploan.open.service.dto.LendingAgrmntCashFlwSchdlSvcIn;
import bankware.corebanking.p2ploan.open.service.dto.LendingAgrmntCashFlwSchdlSvcOut;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;

/**
 * This service provides lending withdraw schedule inquiry.
 *
 * Author	Hokeun Lee
 * History
 *  2016.02.02	initial version for 3.0
 */
@BxmService("LendingAgrmntCashFlwSchdlSvc")
@CbbClassInfo(classType={"SERVICE"})
@BxmCategory(logicalName = "Lending Arrangement Cash Flow Scheduled Inquiry", description = "Lending Account Collection Scheduled Inquiry")
public class LendingAgrmntCashFlwSchdlSvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ArrCashFlowMngr 	arrCashFlowMngr;	// Arrangement cash flow manger
    private CmnContext 		cmnContext;			// Common context
    private ArrP2pMngr		arrP2pMngr;			// Arrangement P2P manager

    /**
     * 투자 회수 스케쥴을 조회한다.
     * Lending account withdraw schedule inquiry.
     * <pre>
     * flow description
     * 1. 기본 값을 설정한다.
     * 	  1.1 시작일이 null인 경우, MIN_DATE를 설정한다.
     *    1.2 종료일이 null인 경우, MAX_DATE를 설정한다.
     *
     * 1. Set default value
     * 	  1.1 Set inquiry start date when it is null
     * 	  1.2 Set inquiry end date when it is null.
     *
     * 2. 회수 스케쥴을 조회한다.
     *
     * 2. Get the withdraw scheduled information
     *
     * 3. 출력을 조립하고 반환한다.
     *
     * 3. Assemble output data ; cash flow.
     *
     * </pre>
     * @param in (required) LendingAgrmntCashFlwSchdlSvcIn: Arrangement id, Inquiry start date, Inquiry end date
     * @return LendingAgrmntCashFlwSchdlSvcOut: Registration results
     * @throws BizApplicationException
     */
    @CbbSrvcInfo(srvcCd="SPP2050400", srvcNm="Account & Collection Schedule Inquiry", srvcAbrvtnNm="lendingAgrmntCashFlwSchdlInqry" )
    @BxmCategory(logicalName = "Account & Collection Schedule Inquiry")
    @BxmServiceOperation("getLendingCashFlowSchdule")
    public LendingAgrmntCashFlwSchdlSvcOut getLendingCashFlowSchdule(LendingAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {
        LendingAgrmntCashFlwSchdlSvcOut output = new LendingAgrmntCashFlwSchdlSvcOut();

        // Set Default Value
        _setDefaultValue(in);

        if(in.getArrId() == null || in.getArrId().isEmpty()) {
            output = _getCollectionInfoByCustId(in);
        } else {
            output = _getCollectionInfoByArrId(in);
        }

        return output;
    }

    /**
     *  Set default value.
     *  set start date when it is null.
     *
     * @param in LendingAgrmntCashFlwSchdlSvcIn: Lending Agreement Cash Flow Schedule Input
     * @return void
     * @throws BizApplicationException
     */
    private void _setDefaultValue(LendingAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {

        if(in.getCustId() == null || in.getCustId().isEmpty()) {
            in.setCustId(_getCmnContext().getCustId());
        }

        if(in.getInqryEndDt() == null || in.getInqryEndDt().isEmpty()) {
            in.setInqryEndDt(CCM01.MAX_DATE);
        }

        if(in.getInqryStartDt() == null || in.getInqryStartDt().isEmpty()) {
            in.setInqryStartDt(CCM01.MIN_DATE);
        }
    }

    /**
     * Get the collection schedule information by customer identification
     *
     * @param in LendingAgrmntCashFlwSchdlSvcIn: Lending Agreement Cash Flow Schedule Input
     * @return Registration results
     * @throws BizApplicationException
     */
    private LendingAgrmntCashFlwSchdlSvcOut _getCollectionInfoByCustId(LendingAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {

        LendingAgrmntCashFlwSchdlSvcOut out = new LendingAgrmntCashFlwSchdlSvcOut();
        List<AcctRpymntSchdldOut> lendingArgmntCashFlwSchdlOut = new ArrayList<AcctRpymntSchdldOut>();

        // Get Lending Arrangement by customer identification
        List<ArrReal> arrLendingList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), ArrStsEnum.ACTIVE, in.getInqryStartDt(), in.getInqryEndDt());

        for(ArrReal arrLending : arrLendingList) {
            List<AcctRpymntSchdldOut> arrAgrmntCashFlwSchdldOut = new ArrayList<AcctRpymntSchdldOut>();
            arrAgrmntCashFlwSchdldOut = _getCollectionSchdldInfo(in, arrLending.getArrId());

            for(AcctRpymntSchdldOut acctRpymntSchdldOut : arrAgrmntCashFlwSchdldOut) {
                lendingArgmntCashFlwSchdlOut.add(acctRpymntSchdldOut);
            }
        }

        out.setRpymntSchdldList(lendingArgmntCashFlwSchdlOut);

        return out;
    }

    /**
     * Get the collection schedule information by arrangement identification
     *
     * @param in LendingAgrmntCashFlwSchdlSvcIn: Lending Agreement Cash Flow Schedule Input
     * @return Registration results
     * @throws BizApplicationException
     */
    private LendingAgrmntCashFlwSchdlSvcOut _getCollectionInfoByArrId(LendingAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {

        LendingAgrmntCashFlwSchdlSvcOut out = new LendingAgrmntCashFlwSchdlSvcOut();
        List<AcctRpymntSchdldOut> arrAgrmntCashFlwSchdldOut = new ArrayList<AcctRpymntSchdldOut>();

        arrAgrmntCashFlwSchdldOut = _getCollectionSchdldInfo(in, in.getArrId());

        out.setRpymntSchdldList(arrAgrmntCashFlwSchdldOut);

        return out;
    }


    /**
     * Get the collection schedule information by arrangement.
     *
     * @param in LendingAgrmntCashFlwSchdlSvcIn: Lending Agreement Cash Flow Schedule Input
     * @param arrId Arrangement identification
     * @return Schedule
     * @throws BizApplicationException
     */
    private List<AcctRpymntSchdldOut> _getCollectionSchdldInfo(LendingAgrmntCashFlwSchdlSvcIn in, String arrId) throws BizApplicationException {

        List<ArrCashFlowIO> cashFlowList = _getArrCashFlowMngr().getArrDuedateAdventListByArrIdentification(_getCmnContext().getInstCode(), arrId, in.getInqryStartDt(), in.getInqryEndDt());

        List<AcctRpymntSchdldOut> acctRpymntSchdldOutList = new ArrayList<AcctRpymntSchdldOut>();

        // Set the re-payment schedule
        for (ArrCashFlowIO cashFlowItm : cashFlowList) {
            AcctRpymntSchdldOut acctRpymntSchdldOut = new AcctRpymntSchdldOut();

            if (RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue().equals(cashFlowItm.getRpymntStsCd())) {   // RPYMNT_STS_CD_1 : Not payed yet.
                acctRpymntSchdldOut.setNthNbr(cashFlowItm.getSeqNbr()); // Sequence
                acctRpymntSchdldOut.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt()); // Repayment scheduled date
                acctRpymntSchdldOut.setRpymntSchdldAmt(cashFlowItm.getRpymntSchdldAmt()); // Repayment scheduled amount
                acctRpymntSchdldOut.setAmtTpCd(cashFlowItm.getAmtTpCd());

                // 00000: Principal Amount, 10201: Interest
                if (AmtTpEnum.PRNCPL.getValue().equals(cashFlowItm.getAmtTpCd())) {
                    acctRpymntSchdldOut.setPrncpl(cashFlowItm.getRpymntSchdldAmt()); // Principal amount
                } else {
                    acctRpymntSchdldOut.setIntAmt(cashFlowItm.getRpymntSchdldAmt()); // Interest amount
                }

                acctRpymntSchdldOutList.add(acctRpymntSchdldOut);
            }
        }

        return acctRpymntSchdldOutList;
    }

    /**
     * @return the arrCashFlowMngr
     */
    private ArrCashFlowMngr _getArrCashFlowMngr() {
        if (arrCashFlowMngr == null) {
            arrCashFlowMngr = (ArrCashFlowMngr) CbbApplicationContext.getBean(
                    ArrCashFlowMngr.class, arrCashFlowMngr);
        }
        return arrCashFlowMngr;
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
     * @return the arrP2pMngr
     */
    private ArrP2pMngr _getArrP2pMngr() {
        if (arrP2pMngr == null) {
            arrP2pMngr = (ArrP2pMngr) CbbApplicationContext.getBean(ArrP2pMngr.class, arrP2pMngr);
        }
        return arrP2pMngr;
    }
}
