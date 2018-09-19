package bankware.corebanking.p2ploan.repayment.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.information.service.dto.LnListOut;
import bankware.corebanking.p2ploan.repayment.service.dto.LnRpymntPlnListIn;
import bankware.corebanking.p2ploan.repayment.service.dto.LnRpymntPlnListOut;
import bankware.corebanking.p2ploan.repayment.service.dto.LnRpymntTx;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * This service provides loan account repayment schedule query.
 *
 * Author	Hokeun Lee
 * History
 *  2015.12.30	initial version for 2.3
 */
@BxmService("LnRpymntPlnListSvc")
@CbbClassInfo(classType = { "SERVICE" })
@BxmCategory(logicalName = "Loan Repayments Plan List Inquiry", description = "Loan Repayments Plan List Inquiry")
public class LnRpymntPlnListSvc {
    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ArrCashFlowMngr	arrCashFlowMngr; // Arrangement cash flow manager
    private CmnContext 		cmnContext;		// Common context

    /**
     * 대출 상환 스케쥴 조회.
     * Loan Account Repayments Schedule Inquiry.
     *
     * <pre>
     * flow description
     * 1. 기본값을 설정한다.
     * 	  1.1 시작일이 null이라면 MIN_DATE를 설정한다.
     * 	  1.2 종료일이 null이라면 MAX_DATE를 설정한다.
     *
     * 1. Set default value
     * 	  1.1 Set inquiry start date when it is null
     * 	  1.2 Set inquiry end date when it is null.
     *
     * 2. 대출 계약의 기본 정보를 조회한다.
     *
     * 2. Get the number of arrangement information by arrangement identification. {@link bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr#getArr}
     *    2.1 Get arrangement's basic information.
     *
     * 3. 대출 계약의 스케쥴을 조회한다.
     *
     * 3. Get the number of repayments scheduled information.
     *    3-1. Get repayments scheduled Information
     *
     * 4. 출력을 조립하고 반환한다.
     *
     * 4. Assemble output data ; cash flow.
     * </pre>
     *
     * @param in (required) LnRpymntPlnListIn: Arrangement id list, Inquiry start date, Inquiry end date
     * @return LnRpymntPlnListOut: Registration results
     * @throws BizApplicationException
     */
    @CbbSrvcInfo(srvcCd = "SPP1090400", srvcNm = "Loan Repayment Schedule Inquiry", srvcAbrvtnNm = "lnRpymntPlnListInqry")
    @BxmCategory(logicalName = "Loan Repayment Plan List Inquiry")
    @BxmServiceOperation("getLoanRepaymentPlanList")
    @TransactionalOperation
    public LnRpymntPlnListOut getLoanRepaymentPlanList(LnRpymntPlnListIn in) throws BizApplicationException {

        LnRpymntPlnListOut lnRpymntPlnListOut = new LnRpymntPlnListOut();

        // Set default value
        _setDefaultValue(in);

        // Get repayments plan list
        lnRpymntPlnListOut = _getRepaymentPlanList(in);

        return lnRpymntPlnListOut;
    }

    /**
     * Set default value. set start date and end date when it is null
     *
     * @param in (required) LnRpymntPlnListIn: Loan Repayments Plan List Input
     * @return void
     * @throws BizApplicationException
     */
    private void _setDefaultValue(LnRpymntPlnListIn in) throws BizApplicationException {

        if (in.getInqryStartDt() == null || in.getInqryStartDt().isEmpty()) {
            in.setInqryStartDt(CCM01.MIN_DATE);
        }

        if (in.getInqryEndDt() == null || in.getInqryEndDt().isEmpty()) {
            in.setInqryEndDt(CCM01.MAX_DATE);
        }
    }

    /**
     * Get repayments scheduled List the number of arrangement
     *
     * @param in (required) LnRpymntPlnListIn: Loan repayments plan list input
     * @return LnRpymntPlnListOut: Repayment schedule
     * @throws BizApplicationException
     */
    private LnRpymntPlnListOut _getRepaymentPlanList(LnRpymntPlnListIn in) throws BizApplicationException {

        LnRpymntPlnListOut out = new LnRpymntPlnListOut();
        List<LnRpymntTx> lnRpymntTxList = new ArrayList<LnRpymntTx>();

        // Get the number of arrangement information
        for (LnListOut lnList : in.getArrIdList()) {
            // Get arrangement information for repayments

            // Get cash flow list
            List<ArrCashFlowIO> cashFlowList = _getArrCashFlowMngr().getArrDuedateAdventListByArrIdentification(_getCmnContext().getInstCode(), lnList.getArrId(), in.getInqryStartDt(), in.getInqryEndDt());

            for (ArrCashFlowIO cashFlowItm : cashFlowList) {
                if (cashFlowItm.getRpymntStsCd().equals(RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue())) { // Repayments not yet
                    LnRpymntTx lnRpymntTx = new LnRpymntTx();

                    lnRpymntTx.setArrId(lnList.getArrId());
                    lnRpymntTx.setRpymntCyclNbr(cashFlowItm.getRpymntCyclNbr());
                    lnRpymntTx.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt());
                    if (cashFlowItm.getAmtTpCd().equals(AmtTpEnum.PRNCPL.getValue())) { // 00000: Principal Amount
                        lnRpymntTx.setRpymntPrncpl(cashFlowItm.getRpymntSchdldAmt());
                        lnRpymntTx.setRpymntAmt(cashFlowItm.getRpymntSchdldAmt());
                    } else { // 10201: Interest
                        lnRpymntTx.setIntAmt(cashFlowItm.getRpymntSchdldAmt());
                        lnRpymntTx.setRpymntAmt(cashFlowItm.getRpymntSchdldAmt());
                    }

                    // Calculate overdue interest and early terminate fee.
                    // 2016.01.11 Templete Input
//    				StlmntRsltVal stlmntRsltVal = intCalculatorLnMngr.calculateInterestRegularRepayment(arr, crncyCd, cmnSysHdrUtil.getBusinessDate(), lnRpymntTx.getRpymntAmt(), CashTrnsfrEnum.TRNSFR, lnRpymntTx.getRpymntAmt(), false);
//    		    	IntCalcnLnRsltOut calc = stlmntRsltVal.getIntCalcnLnRslt();
//
//    		    	if(calc != null) {
//    		        	lnRpymntTx.setTotPrncplOvrduIntAmt(calc.getTotPrncplOvrduIntAmt());		
//    		        	lnRpymntTx.setTotIntOvrduIntAmt(calc.getTotIntOvrduIntAmt());			
//    		        	lnRpymntTx.setErlyTrmntnFee(calc.getErlyTrmntnFee());					
//    		        	lnRpymntTx.setTotOvrduIntAmt(calc.getTotOvrduIntAmt());					
//    		    	} else {
                    lnRpymntTx.setTotPrncplOvrduIntAmt(BigDecimal.ZERO); // Principal overdue interest	
                    lnRpymntTx.setTotIntOvrduIntAmt(BigDecimal.ZERO); // Interest overdue interest
                    lnRpymntTx.setErlyTrmntnFeeAmt(BigDecimal.ZERO); // Early Terminate Fee
                    lnRpymntTx.setTotOvrduIntAmt(BigDecimal.ZERO); // Overdue interest
//    		    	}

                    lnRpymntTxList.add(lnRpymntTx);
                }
            }
        }

        out.setLnRpymntTxList(lnRpymntTxList);

        return out;
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
}
