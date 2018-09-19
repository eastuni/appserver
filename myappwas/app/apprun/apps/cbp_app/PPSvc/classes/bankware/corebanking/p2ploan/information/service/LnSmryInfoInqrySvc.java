package bankware.corebanking.p2ploan.information.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowInfoAllOut;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.information.service.dto.LnSmryInfoInqrySvcLnSmryInfoIn;
import bankware.corebanking.p2ploan.information.service.dto.LnSmryInfoInqrySvcLnSmryInfoOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;

/**
 * 이 서비스는 P2P대출요약정보를 조회한다.
 * This service allows to inquire P2P loan Summary Information
 *
 * Author	Hokeun Lee
 * History
 *  2016.01.18	initial version for 3.0
 */
@BxmService("LnSmryInfoInqrySvc")
@CbbClassInfo(classType={"SERVICE"})
@BxmCategory(logicalName = "Loan Summary Information Inquiry", description = "Loan Summary Information Inquiry")
public class LnSmryInfoInqrySvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private CmnContext 			cmnContext;			// Common context
    private ArrCustMngr			arrCustMngr;		// Arrangement customer manager
    private ArrBalMngr			arrBalMngr;			// Arrangement balance manager
    private ArrCashFlowMngr		arrCashFlowMngr;	// Arrangement cash flow manager
    private ArrCndInqryBizProc	arrCndInqryBizProc;

	/**
	 * 고객식별자를 이용하여 대출 요약 정보를 조회한다.
	 * Loan Summary Information by Customer Identification 
	 * <pre>
	 * flow description
	 * 
	 * 1. Set default value
	 *    1.1 Set Customer Identification when it is null
	 * 
	 * 2. Loop The number of Loan arrangement
	 *    3.1 Get Loan arrangement information by arrangement identification
	 *    3.2 Assemble arrangement Status Specific Count and Summary Loan Amount
	 *      3.2.1 Assemble arrangement Count and Summary Loan amount if Arrangement Status Code is 'D:Start Bidding'
	 *      3.2.2 Assemble arrangement Count and Summary Loan amount if Arrangement Status Code is 'F:Failure Bid'
	 *      3.2.3 Assemble arrangement Count and Summary Loan amount, Loan Balance, Principal Amount, Overdue Principal Amount, Overdue Interest Amount if Arrangement Status Code is 'A:Active' 
	 *      3.2.4 Assemble arrangement Count and Summary Loan amount if Arrangement Status Code is 'T:Terminate'
	 *    
	 * 3. Build Output data 
	 *    3.1 Output data generation
	 *  
	 * </pre>
	 * @param in (required) LnSmryInfoInqrySvcLnSmryInfoIn: Customer identification
	 * @return LnSmryInfoInqrySvcLnSmryInfoOut Loan Summary Information
	 * @throws BizApplicationException
	 */
    @CbbSrvcInfo(srvcCd="SPP4070400", srvcNm="Loan Summary Information Inquiry")
    @BxmCategory(logicalName = "Loan Summary Information Inquiry")
    @BxmServiceOperation("getLoanSummaryInformation")
    public LnSmryInfoInqrySvcLnSmryInfoOut getLoanSummaryInformation(LnSmryInfoInqrySvcLnSmryInfoIn in) throws BizApplicationException{

    	LnSmryInfoInqrySvcLnSmryInfoOut out = new LnSmryInfoInqrySvcLnSmryInfoOut();

    	_setDefaultValue(in);

    	out = _getLoanSummaryInfo(in);

    	return out;
    }

    /**
     * initialization
     * @param in (required) LnSmryInfoInqrySvcLnSmryInfoIn
     * @return void
     * @throws BizApplicationException
     */
    private void _setDefaultValue(LnSmryInfoInqrySvcLnSmryInfoIn in) throws BizApplicationException {
    	if(in.getCustId() == null || in.getCustId().isEmpty()) {
    		in.setCustId(_getCmnContext().getCustId());
    	}
    }

    /**
     * Get Loan arrangement information by customer identification
     * and assemble Information the number of Loan arrangement.
     * 
     * @param in (required) LnSmryInfoInqrySvcLnSmryInfoIn
     * @return LnSmryInfoInqrySvcLnSmryInfoOut
     * @throws BizApplicationException
     */
    private LnSmryInfoInqrySvcLnSmryInfoOut _getLoanSummaryInfo(LnSmryInfoInqrySvcLnSmryInfoIn in) throws BizApplicationException {
    	LnSmryInfoInqrySvcLnSmryInfoOut out = new LnSmryInfoInqrySvcLnSmryInfoOut();

    	BigDecimal lnAplctnCnt = BigDecimal.ZERO;				// Loan application Count
    	BigDecimal lnAplctnSumAmt = BigDecimal.ZERO;			// Loan application Sum Amount
    	BigDecimal lnOpnCnt = BigDecimal.ZERO;					// Loan Open Count(Loan Success Count)
    	BigDecimal lnOpnSumAmt = BigDecimal.ZERO;				// Loan Open Sum Amount(Loan Success Amount)
    	BigDecimal lnBiddingCnt = BigDecimal.ZERO;				// Loan Bidding Count
    	BigDecimal lnBiddingSumAmt = BigDecimal.ZERO;			// Loan Bidding Sum Amount
    	BigDecimal lnFailureBidCnt = BigDecimal.ZERO;			// Loan Failure Bid Count 
    	BigDecimal lnFailureBidSumAmt = BigDecimal.ZERO;		// Loan Failure Bid Sum Amount
    	BigDecimal lnRpymntCnt = BigDecimal.ZERO;				// Loan Repayments Count
    	BigDecimal lnRpymntSumAmt = BigDecimal.ZERO;			// Loan Repayments Sum Amount
    	BigDecimal lnTrmntCnt = BigDecimal.ZERO;				// Loan Terminate Count(Loan Completion Count)
    	BigDecimal lnTrmntSumAmt = BigDecimal.ZERO;				// Loan Terminate Sum Amount(Loan Completion Amount)
    	BigDecimal lnRpymntOfPrncplSumAmt = BigDecimal.ZERO;	// Loan Repayments of Principal Sum Amount(Repaid principal Amount)
    	BigDecimal lnBalSumAmt = BigDecimal.ZERO;				// Loan Balance Sum Amount
    	BigDecimal lnRpymntOfIntSumAmt = BigDecimal.ZERO;		// Loan Repayments of Interest Sum Amount(Repaid interest Amount)
    	BigDecimal lnOvrduPrncplSumAmt = BigDecimal.ZERO;		// Loan Overdue Principal Sum Amount
    	BigDecimal lnOvrduIntSumAmt = BigDecimal.ZERO;			// Loan Overdue Interest Sum Amount

		// 2016.03.16 계약목록 변경 오윤화
		String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
    	//List<ArrReal> arrLoanList = arrCustMngr.getCustOwnLoanArrList(in.getCustId(), null, CCM01.MIN_DATE, CCM01.MAX_DATE);
		List<ArrReal> arrLoanList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), null, bizDscd, null, null, null);

    	for(ArrReal arrLoan : arrLoanList) {
    		String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arrLoan.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
    		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arrLoan.getArrCnd(PdCndEnum.CURRENCY.getValue()));
    		BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);		// Loan Contract Amount

    		// Current Loan Balance Amount
    		ArrBal arrBal = _getArrBalMngr().getArrBal(arrLoan, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
    		BigDecimal balAmt = arrBal.getLastBal();

    		// Total Repayments Amount by Principal and Interest
    		BigDecimal arrRepaymentPrincipal = _getArrBalMngr().getArrBal(arrLoan, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.TOT_REPAYMENT_AMOUNT.getValue(), crncyCd).getLastBal();	
//    		BigDecimal arrRepaymentInterest = arrBalMngr.getArrBal(arrLoan, AmtTpEnum.INT.getValue(), BalTpEnum.TOT_REPAYMENT_AMOUNT.getValue(), crncyCd).getLastBal();
			ArrBal lnNrmlDpstArrIntBal = _getArrBalMngr().getArrBal(arrLoan, AmtTpEnum.LN_NORMAL_INT.getValue(), BalTpEnum.TOT_DEPOSIT.getValue(), crncyCd);
			BigDecimal lnNrmlDpstBidDecimal = BigDecimal.ZERO;
			if(lnNrmlDpstArrIntBal != null) {
				lnNrmlDpstBidDecimal = lnNrmlDpstArrIntBal.getLastBal();
			}
			ArrBal lnErlyDpstArrIntBal = _getArrBalMngr().getArrBal(arrLoan, AmtTpEnum.LN_ERLY_INT.getValue(), BalTpEnum.TOT_DEPOSIT.getValue(), crncyCd);
			BigDecimal lnErlyDpstBidDecimal = BigDecimal.ZERO;
			if(lnErlyDpstArrIntBal != null) {
				lnErlyDpstBidDecimal = lnErlyDpstArrIntBal.getLastBal();
			}
			BigDecimal arrRepaymentInterest = lnNrmlDpstBidDecimal.add(lnErlyDpstBidDecimal);

    		BigDecimal arrOvrduPrnplAmt = BigDecimal.ZERO;
    		BigDecimal arrOvrduIntAmt = BigDecimal.ZERO;

    		// 대출이 연체이면 연체원금금액, 연체이자금액을 조회한다.
    		if(_getArrCashFlowMngr().isOverDue((Arr) arrLoan, _getCmnContext().getTxDate())) {
    			ArrCashFlowInfoAllOut arrCashFlowInfoAll = _getArrCashFlowMngr().getArrCashFlowScheduleAll((Arr) arrLoan);
    			// To_Do 향후 연체원금금액, 연체이자금액이 추가되면 값을 변경함.
        		arrOvrduPrnplAmt = arrCashFlowInfoAll.getLonBal();
        		arrOvrduIntAmt = arrCashFlowInfoAll.getLonBal();
    		}

    		if(arrLoan.getArrSts().equals(ArrStsEnum.APPLIED)) {
    			lnAplctnCnt = lnAplctnCnt.add(BigDecimal.ONE);
    			lnAplctnSumAmt = lnAplctnSumAmt.add(cntrtAmt);
    		}

    		if(arrLoan.getArrSts().equals(ArrStsEnum.START_BID)) {		// Bidding Loan Count and Loan Sum Contract Amount
    			lnBiddingCnt = lnBiddingCnt.add(BigDecimal.ONE);
    			lnBiddingSumAmt = lnBiddingSumAmt.add(cntrtAmt);
    		}

    		if(arrLoan.getArrSts().equals(ArrStsEnum.FAILURE)) {		// Failure Bid Loan Count and Loan Sum Contract Amount
    			lnFailureBidCnt = lnFailureBidCnt.add(BigDecimal.ONE);
    			lnFailureBidSumAmt = lnFailureBidSumAmt.add(cntrtAmt);
    		}

    		if(arrLoan.getArrSts().equals(ArrStsEnum.TERMINATED)) {		// Terminate Loan Count and Loan Sum Contract Amount
    			lnTrmntCnt = lnTrmntCnt.add(BigDecimal.ONE);
    			lnTrmntSumAmt = lnTrmntSumAmt.add(cntrtAmt);
    			lnRpymntOfPrncplSumAmt = lnRpymntOfPrncplSumAmt.add(arrRepaymentPrincipal);
    			lnRpymntOfIntSumAmt = lnRpymntOfIntSumAmt.add(arrRepaymentInterest);
    		}

    		if(arrLoan.getArrSts().equals(ArrStsEnum.ACTIVE)) {		// Active Loan Count and Loan Sum Amount
    			lnRpymntCnt = lnRpymntCnt.add(BigDecimal.ONE);
    			lnRpymntSumAmt = lnRpymntSumAmt.add(cntrtAmt);
    			lnBalSumAmt = lnBalSumAmt.add(balAmt);
    			lnRpymntOfPrncplSumAmt = lnRpymntOfPrncplSumAmt.add(arrRepaymentPrincipal);
    			lnRpymntOfIntSumAmt = lnRpymntOfIntSumAmt.add(arrRepaymentInterest);
    			lnOvrduPrncplSumAmt = lnOvrduPrncplSumAmt.add(arrOvrduPrnplAmt);
    			lnOvrduIntSumAmt = lnOvrduIntSumAmt.add(arrOvrduIntAmt);
    		}

    	}	// end of for

    	// Loan Success Count and Amount = In Repayments Loan + Completion Loan
    	lnOpnCnt = lnRpymntCnt.add(lnTrmntCnt);
    	lnOpnSumAmt = lnRpymntSumAmt.add(lnTrmntSumAmt);

    	// Loan Application Count And Amount = Success Loan + In Bidding Loan + Failure Bid Loan
    	lnAplctnCnt = lnAplctnCnt.add(lnOpnCnt.add(lnBiddingCnt.add(lnFailureBidCnt)));
    	lnAplctnSumAmt = lnAplctnSumAmt.add(lnOpnSumAmt.add(lnBiddingSumAmt.add(lnFailureBidSumAmt)));

    	// Generate Output data
    	out.setLnAplctnCnt(lnAplctnCnt);
    	out.setLnAplctnSumAmt(lnAplctnSumAmt);
    	out.setLnOpnCnt(lnOpnCnt);
    	out.setLnOpnSumAmt(lnOpnSumAmt);
    	out.setLnBiddingCnt(lnBiddingCnt);
    	out.setLnBiddingSumAmt(lnBiddingSumAmt);
    	out.setLnFailrBidCnt(lnFailureBidCnt);
    	out.setLnFailrBidSumAmt(lnFailureBidSumAmt);
    	out.setLnRpymntCnt(lnRpymntCnt);
    	out.setLnRpymntSumAmt(lnRpymntSumAmt);
    	out.setLnTrmntCnt(lnTrmntCnt);
    	out.setLnTrmntSumAmt(lnTrmntSumAmt);
    	out.setLnRpymntOfPrncplSumAmt(lnRpymntOfPrncplSumAmt);
    	out.setLnBalSumAmt(lnBalSumAmt);
    	out.setLnRpymntOfIntSumAmt(lnRpymntOfIntSumAmt);
    	out.setLnOvrduPrncplSumAmt(lnOvrduPrncplSumAmt);
    	out.setLnOvrduIntSumAmt(lnOvrduIntSumAmt);

    	return out;
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
	 * @return the arrBalMngr
	 */
	private ArrBalMngr _getArrBalMngr() {
		if (arrBalMngr == null) {
			arrBalMngr = (ArrBalMngr) CbbApplicationContext.getBean(ArrBalMngr.class, arrBalMngr);
		}
		return arrBalMngr;
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
	 * @return the arrCndInqryBizProc
	 */
	private ArrCndInqryBizProc _getArrCndInqryBizProc() {
		if (arrCndInqryBizProc == null) {
			arrCndInqryBizProc = (ArrCndInqryBizProc) CbbApplicationContext.getBean(
					ArrCndInqryBizProc.class, arrCndInqryBizProc);
		}
		return arrCndInqryBizProc;
	}
}
