package bankware.corebanking.p2ploan.open.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.loan.query.service.dto.AcctRpymntSchdldOut;
import bankware.corebanking.p2ploan.open.service.dto.LnAgrmntCashFlwSchdlSvcIn;
import bankware.corebanking.p2ploan.open.service.dto.LnAgrmntCashFlwSchdlSvcOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * This service provides loan repaymnet information inquiry.
 *
 * Author	Hokeun Lee
 * History
 *  2015.12.18	initial version for 2.3
 */
@BxmService("LnAgrmntCashFlwSchdlSvc")
@CbbClassInfo(classType={"SERVICE"})
@BxmCategory(logicalName = "Loan Arrangement Cash Flow Scheduled Inquiry", description = "Loan Account Repayment Scheduled Inquiry")
public class LnAgrmntCashFlwSchdlSvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ArrCashFlowMngr	arrCashFlowMngr;	// Arrangement Cash Flow Manger I/F
    private ArrCustMngr		arrCustMngr;		// Arrangement Customer Manager I/F
    private CmnContext 		cmnContext;			// Common System Header Util

    /**
     * Loan Account Repayments Schedule Inquiry
     * <pre>
     * flow description
     *
     * 1. 기본값을 설정한다.
     * 	  1.1 시작일이 null이라면 MIN_DATE를 설정한다.
     * 	  1.2 종료일이 null이라면 MAX_DATE를 설정한다.
     *
     * 1. Set default value
     * 	  1.1 Set inquiry start date when it is null
     * 	  1.2 Set inquiry end date when it is null.
     *
     * 2. 상환 스케쥴 정보를 조회한다.
     *
     * 2. Get repayments scheduled Information
     *
     * 3. 출력을 조립하고 반환한다.
     *
     * 3. Assemble output data ; cash flow.
     *
     * </pre>
     * @param in (required) LnAgrmntCashFlwSchdlSvcIn : Arrangement id, Inquiry start date, Inquiry end date
     * @return LnAgrmntCashFlwSchdlSvcOut : Registration results
     * @throws BizApplicationException
     */
    @CbbSrvcInfo(srvcCd="SPP0140400", srvcNm="Account & Repayment Schedule Inquiry")
    @BxmCategory(logicalName = "Account & Repayment Schedule Inquiry")
    @BxmServiceOperation("getLoanCashFlowSchedule")
    @TransactionalOperation
    public LnAgrmntCashFlwSchdlSvcOut getLoanCashFlowSchedule(LnAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException{

        LnAgrmntCashFlwSchdlSvcOut output = new LnAgrmntCashFlwSchdlSvcOut();

        /**
         * Set the default value
         */
        _setDefaultValue(in);

        /**
         * Get the re-payment schedule
         */
        if(in.getArrId() == null || in.getArrId().isEmpty()) {
            output = _getRepaymentScheduledInformationByCustomerIdentification(in);
        } else {
            output = _getRepaymentScheduledInformationByArrangementIdentification(in);
        }

        return output;
    }

    /**
     *  Set default value.
     *
     * @param in LnAgrmntCashFlwSchdlSvcIn: Loan Agreement Cash Flow Schedule Input
     * @return void
     * @throws BizApplicationException
     */
    private void _setDefaultValue(LnAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {

        if(in.getInqryStartDt() == null || in.getInqryStartDt().isEmpty()){
            in.setInqryStartDt(CCM01.MIN_DATE);
        }

        if(in.getInqryEndDt() == null || in.getInqryEndDt().isEmpty()){
            in.setInqryEndDt(CCM01.MAX_DATE);
        }

        if(in.getCustId() == null || in.getCustId().isEmpty()) {
            in.setCustId(_getCmnContext().getCustId());
        }
    }

    /**
     * Get the repayments schedule information by customer identification
     *
     * @param in LnAgrmntCashFlwSchdlSvcIn: Loan Agreement Cash Flow Schedule Input
     * @return Repayment schedule
     * @throws BizApplicationException
     */
    private LnAgrmntCashFlwSchdlSvcOut _getRepaymentScheduledInformationByCustomerIdentification(LnAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {

        LnAgrmntCashFlwSchdlSvcOut out = new LnAgrmntCashFlwSchdlSvcOut();
        List<AcctRpymntSchdldOut> lnAgrmntCashFlwSchdldOut = new ArrayList<AcctRpymntSchdldOut>();

        // 2016.03.16 계약목록 변경 오윤화
        String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
        //List<ArrReal> arrRealList = arrCustMngr.getCustOwnLoanArrList(in.getCustId(), ArrStsEnum.ACTIVE, in.getInqryStartDt(), in.getInqryEndDt());
        List<ArrReal> arrRealList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), ArrStsEnum.ACTIVE, bizDscd, null, null, null);

        for(ArrReal arrReal : arrRealList) {
            List<AcctRpymntSchdldOut> arrAgrmntCashFlwSchdldOut = new ArrayList<AcctRpymntSchdldOut>();
            arrAgrmntCashFlwSchdldOut = _getRepaymentScheduledInformation(in, arrReal.getArrId());

            for(AcctRpymntSchdldOut acctRpymntSchdldOut : arrAgrmntCashFlwSchdldOut) {
                lnAgrmntCashFlwSchdldOut.add(acctRpymntSchdldOut);
            }
        }

        out.setRpymntSchdldList(lnAgrmntCashFlwSchdldOut);
        return out;
    }
    /**
     * Get the repayments schedule information by arrangement identification
     *
     * @param in LnAgrmntCashFlwSchdlSvcIn: Loan Agreement Cash Flow Schedule Input
     * @return Repayment schedule
     * @throws BizApplicationException
     */
    private LnAgrmntCashFlwSchdlSvcOut _getRepaymentScheduledInformationByArrangementIdentification(LnAgrmntCashFlwSchdlSvcIn in) throws BizApplicationException {

        LnAgrmntCashFlwSchdlSvcOut out = new LnAgrmntCashFlwSchdlSvcOut();
        List<AcctRpymntSchdldOut> lnAgrmntCashFlwSchdldOut = new ArrayList<AcctRpymntSchdldOut>();

        // Get repayments scheduled information
        lnAgrmntCashFlwSchdldOut = _getRepaymentScheduledInformation(in, in.getArrId());

        out.setRpymntSchdldList(lnAgrmntCashFlwSchdldOut);

        return out;
    }
    /**
     * Get the repayments schedule information by arrangement.
     *
     * @param in LnAgrmntCashFlwSchdlSvcIn: Loan Agreement Cash Flow Schedule Input
     * @param arrId Arrangement identification
     * @return Repayment schedule
     * @throws BizApplicationException
     */
    private List<AcctRpymntSchdldOut> _getRepaymentScheduledInformation(LnAgrmntCashFlwSchdlSvcIn in, String arrId) throws BizApplicationException {

        // Get cash flow list.
        List<ArrCashFlowIO> cashFlowList = _getArrCashFlowMngr().getArrDuedateAdventListByArrIdentification(_getCmnContext().getInstCode(), arrId, in.getInqryStartDt(), in.getInqryEndDt());

        List<AcctRpymntSchdldOut> acctRpymntSchdldOutList = new ArrayList<AcctRpymntSchdldOut>();

        // Set the re-payment schedule
        for (ArrCashFlowIO cashFlowItm : cashFlowList) {
            AcctRpymntSchdldOut acctRpymntSchdldOut = new AcctRpymntSchdldOut();

            if (RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue().equals(cashFlowItm.getRpymntStsCd())) {   // RPYMNT_STS_CD_1 : Not payed yet.
                acctRpymntSchdldOut.setRpymntStsCd(cashFlowItm.getRpymntStsCd());
                acctRpymntSchdldOut.setNthNbr(cashFlowItm.getSeqNbr()); // Sequence
                acctRpymntSchdldOut.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt());		// Repayment scheduled date
                acctRpymntSchdldOut.setRpymntSchdldAmt(cashFlowItm.getRpymntSchdldAmt());	// Repayment scheduled amount
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
     * @return the arrCustMngr
     */
    private ArrCustMngr _getArrCustMngr() {
        if (arrCustMngr == null) {
            arrCustMngr = (ArrCustMngr) CbbApplicationContext.getBean(
                    ArrCustMngr.class, arrCustMngr);
        }
        return arrCustMngr;
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
}
