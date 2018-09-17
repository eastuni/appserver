package bankware.corebanking.p2p.accountsummary.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.actor.customer.interfaces.CustMngr;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrP2pMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.actor.actor.interfaces.dto.ActorXtnAtrbtIO;
import bankware.corebanking.core.actor.enums.ActorTpEnum;
import bankware.corebanking.core.actor.enums.AtrbtNmEnum;
import bankware.corebanking.core.actor.enums.CustGradeKndTpEnum;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowInfoAllOut;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2p.accountsummary.service.dto.AcctSmryInqrySvcIn;
import bankware.corebanking.p2p.accountsummary.service.dto.AcctSmryInqrySvcMbrOut;
import bankware.corebanking.p2p.accountsummary.service.dto.AcctSmryInqrySvcOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.amountcalculator.interfaces.P2PDvdndCalculator;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는  P2P 고객의 대출과 투자 정보, 계좌정보를 조회한다.
 * This service allows to inquire P2P customer's Loan, investment and account information
 *
 * Author
 * History
 *  2016. 3. 3	initial version for 3.0
 */
@BxmService("AcctSmryInqrySvc")
@BxmCategory(logicalName = "총괄표 Account summary", description = "총괄표 Account summary")
@CbbClassInfo(classType = { "SERVICE" })
public class AcctSmryInqrySvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ArrP2pMngr 				arrP2pMngr; 			// Arrangement P2P manager
    private ArrCustMngr				arrCustMngr;			// Arrangement customer manager
    private ArrCndInqryBizProc		arrCndInqryBizProc;		// Arrangement inquiry bizproc
    private CustMngr 				custMngr; 				// Customer manager
    private ArrBalMngr				arrBalMngr;				// Arrangement banlace manager
    private ArrCashFlowMngr			arrCashFlowMngr;		// Arrangement cash flow manager
    private CmnContext 				cmnContext;				// Common context
    private CustInfoInqryBizProc		custInfoInqryBizProc;	// Customer information inquiry bizproc
    private P2PDvdndCalculator		p2PDvdndCalculator; 	// Dividend Calculator P2P Interface
    /**
     * Search customer Information
     * 고객의 정보를 조회한다.

     * <pre>
     * 1. Check the input parameter by _validateInput method
     * 2. get customer authority Data. We called CustAuthData
     * 3. Assemble the customer information & return
     * </pre>
     *
     * @param in (required) AcctSmryInqrySvcIn: Customer identification,  Arrangement status code, Inquiry start date, Inquiry end date, Department identification
     * @return AcctSmryInqrySvcOut Account summary information
     * @throws BizApplicationException
     */

    @BxmServiceOperation("accountSummary")
    @TransactionalOperation
    @CbbSrvcInfo(srvcCd = "SPP4170400", srvcNm = "Account Summary")
    @BxmCategory(logicalName = "Account Summary")
    public AcctSmryInqrySvcOut accountSummary(AcctSmryInqrySvcIn in) throws BizApplicationException {

        AcctSmryInqrySvcOut out = new AcctSmryInqrySvcOut();

        /**
         * Validate Input Value
         */
        _validateInput(in);

        /**
         * Get the customer authority Data
         */
        _setCustomerAuthenticationData(in, out);

        // investment Information
        List<ArrReal> invstList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), null, in.getInqryStartDt(), in.getInqryEndDt());

        /**
         * Get the customer investment information
         */
        _getInvestmentInformationList(invstList, in, out);

        // Loan Information
        // 2016.03.16  계약목록 변경 오윤화
        String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
        List<ArrReal> arrRealList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), null, bizDscd, null, null, null);

        List<Arr> loanList = new ArrayList<Arr>();
        for(ArrReal arrReal : arrRealList){
            loanList.add((Arr)arrReal);
        }

        /**
         * Get the customer loan information
         */
        _getLoanInformationList(loanList, in, out);

        /**
         * Get the customer last login time
         */
        _setLastLoginInformation(in, out);

        return out;
    }

    private void _validateInput(AcctSmryInqrySvcIn in) throws BizApplicationException {

        if(in.getDeptId() == null || StringUtils.isEmpty(in.getDeptId())){
            // 기관별 파라미터 설정 방식을 통한 회계처리부서 선택하는 방법
        	in.setDeptId(_getCmnContext().getDeptId());
        }
        if(in.getInqryStartDt() == null || StringUtils.isEmpty(in.getInqryStartDt())){
            in.setInqryStartDt(CCM01.MIN_DATE);
        }
        if(in.getInqryEndDt() == null || StringUtils.isEmpty(in.getInqryEndDt())){
            in.setInqryEndDt(CCM01.MAX_DATE);
        }
    }

    private AcctSmryInqrySvcOut _getInvestmentInformationList(List<ArrReal> p2pLendingList, AcctSmryInqrySvcIn in, AcctSmryInqrySvcOut out) throws BizApplicationException {

        BigDecimal invstmntBiddingCnt = BigDecimal.ZERO;
        BigDecimal invstmntBiddingSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntCollectionCnt = BigDecimal.ZERO;
        BigDecimal invstmntCollectionSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntTrmntCnt = BigDecimal.ZERO;
        BigDecimal invstmntTrmntSumAmt = BigDecimal.ZERO;

        for (ArrReal arrReal : p2pLendingList) {
            String strCntrtAmt = _getArrCndInqryBizProc().getArrangementConditionValue(arrReal.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));	// Contract Amount
            BigDecimal cntrtAmt = new BigDecimal(strCntrtAmt);

            if(arrReal.getArrSts().equals(ArrStsEnum.APPLIED)) {	// Bidding Lending Count and Contract Amount
                invstmntBiddingCnt = invstmntBiddingCnt.add(BigDecimal.ONE);
                invstmntBiddingSumAmt = invstmntBiddingSumAmt.add(cntrtAmt);
            }

            if(arrReal.getArrSts().equals(ArrStsEnum.ACTIVE)) {		// Collection Lending Count and Amount
                invstmntCollectionCnt = invstmntCollectionCnt.add(BigDecimal.ONE);
                invstmntCollectionSumAmt = invstmntCollectionSumAmt.add(cntrtAmt);
            }

            if(arrReal.getArrSts().equals(ArrStsEnum.TERMINATED)) {	// Terminate Lending Count and Contract Amount
                invstmntTrmntCnt = invstmntTrmntCnt.add(BigDecimal.ONE);
                invstmntTrmntSumAmt = invstmntTrmntSumAmt.add(cntrtAmt);
            }
        }

        out.setInvstmntBiddingCnt(invstmntBiddingCnt);
        out.setInvstmntBiddingSumAmt(invstmntBiddingSumAmt);
        out.setInvstmntClctnCnt(invstmntCollectionCnt);
        out.setInvstmntClctnSumAmt(invstmntCollectionSumAmt);
        out.setInvstmntTrmntCnt(invstmntTrmntCnt);
        out.setInvstmntTrmntSumAmt(invstmntTrmntSumAmt);

        return out;
    }

    private AcctSmryInqrySvcOut _getLoanInformationList(List<Arr> p2pLendingList, AcctSmryInqrySvcIn in, AcctSmryInqrySvcOut out) throws BizApplicationException {

        BigDecimal lnAplctnCnt = BigDecimal.ZERO;				// Loan application Count
        BigDecimal lnAplctnSumAmt = BigDecimal.ZERO;			// Loan application Sum Amount
        BigDecimal lnBiddingCnt = BigDecimal.ZERO;				// Loan Bidding Count
        BigDecimal lnBiddingSumAmt = BigDecimal.ZERO;			// Loan Bidding Sum Amount
        BigDecimal lnRpymntCnt = BigDecimal.ZERO;				// Loan Repayments Count
        BigDecimal lnRpymntSumAmt = BigDecimal.ZERO;			// Loan Repayments Sum Amount
        BigDecimal lnTrmntCnt = BigDecimal.ZERO;				// Loan Terminate Count(Loan Completion Count)
        BigDecimal lnTrmntSumAmt = BigDecimal.ZERO;				// Loan Terminate Sum Amount(Loan Completion Amount)
        String arrId = "";

        for(Arr arr : p2pLendingList) {
            String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
            BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);

            if(ArrStsEnum.APPLIED.equals(arr.getArrSts()) || ArrStsEnum.INITIATED.equals(arr.getArrSts()) || ArrStsEnum.APPROVED.equals(arr.getArrSts())) {     //  Applied Count and Loan Sum Contract Amount
                lnAplctnCnt = lnAplctnCnt.add(BigDecimal.ONE);
                lnAplctnSumAmt = lnAplctnSumAmt.add(cntrtAmt);
                arrId = arr.getArrId();
                out.setArrStsCd(arr.getArrSts().getValue());
            }

            if(ArrStsEnum.START_BID.equals(arr.getArrSts())) {		// Bidding Loan Count and Loan Sum Contract Amount
                lnBiddingCnt = lnBiddingCnt.add(BigDecimal.ONE);
                lnBiddingSumAmt = lnBiddingSumAmt.add(cntrtAmt);
                arrId = arr.getArrId();
            }

            if(ArrStsEnum.ACTIVE.equals(arr.getArrSts())) {		// Active Loan Count and Loan Sum Amount
                lnRpymntCnt = lnRpymntCnt.add(BigDecimal.ONE);
                lnRpymntSumAmt = lnRpymntSumAmt.add(cntrtAmt);
            }

            if(ArrStsEnum.TERMINATED.equals(arr.getArrSts())) {		// Terminate Loan Count and Loan Sum Contract Amount
                lnTrmntCnt = lnTrmntCnt.add(BigDecimal.ONE);
                lnTrmntSumAmt = lnTrmntSumAmt.add(cntrtAmt);
            }
        }

        out.setLnAplctnCnt(lnAplctnCnt);
        out.setLnAplctnSumAmt(lnAplctnSumAmt);
        out.setLnBiddingCnt(lnBiddingCnt);
        out.setLnBiddingSumAmt(lnBiddingSumAmt);
        out.setLnRpymntCnt(lnRpymntCnt);
        out.setLnRpymntSumAmt(lnRpymntSumAmt);
        out.setLnTrmntCnt(lnTrmntCnt);
        out.setLnTrmntSumAmt(lnTrmntSumAmt);
        out.setArrId(arrId);

        return out;
    }

    private AcctSmryInqrySvcOut _setCustomerAuthenticationData(AcctSmryInqrySvcIn in, AcctSmryInqrySvcOut out) throws BizApplicationException{

        int authDataCnt = _getCustInfoInqryBizProc().countAuthenticationData(in.getCustId());
        String authData = "";

        switch(authDataCnt){

        case 0: authData = "Low";
        break;

        case 1: authData = "Low";
        break;

        case 2: authData = "Medium";
        break;

        case 3: authData = "High";
        break;

        default : authData = "High";
        break;
        }

        out.setCnfrmAuthDataCntnt(authData);

        return out;
    }

    private AcctSmryInqrySvcOut _setLastLoginInformation(AcctSmryInqrySvcIn in, AcctSmryInqrySvcOut out) throws BizApplicationException{

        Cust cust = _getCustMngr().getCust(in.getCustId());
        List<ActorXtnAtrbtIO> xtnAtrbtList = cust.getListExtendedAttribute();
        String previousLogin = "";

        if(xtnAtrbtList != null && !xtnAtrbtList.isEmpty()) {
            for(ActorXtnAtrbtIO item : xtnAtrbtList) {
                if(AtrbtNmEnum.PREVIOUS_LOGIN_TIMESTAMP.getValue().equals(item.getXtnAtrbtNm())){
                    previousLogin = item.getXtnAtrbtCntnt();
                }
            }
        }

        out.setPrvsLoinTmstmp(previousLogin);

        return out;
    }

    /**
    * 이 서비스는  P2P 고객의 대출과 투자 정보,계좌정보, 개인정보를 조회한다.
    * This service allows to inquire P2P customer's Loan, investment account and personal information
    *
    * <pre>
    * 1. 고객 식별자로 고객을 가져온다.
    * 1. Get the customer using customer identification.
    *
    * 2. 고객의 정보(대출, 투자, 계좌정보, 개인정보)를 조회한다.
    *	2.1 input parameter를 check한다.
    * 	2.2  고객의 정보를 얻는다.
    * 	2.3  필요한 고객의 정보만 조립하여 반환한다.
    *
    * 2. Assemble the customer information(Loan, Invest account and personal information) & return
    * 	2.1  Check the input parameter by _validateInput2 method
    * 	2.2  Get customer information
    * 	2.3  Assemble the necessary information and return.
    *
    *</pre>
    * @param  in (required) AcctSmryInqrySvcIn: Customer identification, Arrangement status code, Inquiry Start date, Inquiry end date, Department identification
    * @return AcctSmryInqrySvcMbrOut Member's account summary information
    * @throws BizApplicationException
    */

    @BxmServiceOperation("accountSummaryCustGrade")
    @TransactionalOperation
    @CbbSrvcInfo(srvcCd = "SPP4170402", srvcNm = "Account Summary Cust Grade")
    public AcctSmryInqrySvcMbrOut accountSummaryCustGrade(AcctSmryInqrySvcIn in) throws BizApplicationException {

        AcctSmryInqrySvcMbrOut out = new AcctSmryInqrySvcMbrOut();

        /**
         * Get the customer
         */
        Cust cust = _getCustMngr().getCust(in.getCustId());

        if (cust == null) {
            throw new BizApplicationException("AAPARE0003", new Object[] { in.getCustId() });
        }
        /**
         * Validate Input Value
         */
        _validateInput(in);

        /**
         * Get customer information about customer number, age and customer phone number
         */
        _setMemberInformation(in, out);

        /**
         * Get customer Grade
         */
        _setCustomerGrade(in, out);

        /**
         * Get customer loan information
         */
        _getLoanSummaryInformation(in, out);

        /**
         * Get customer investment information
         */
        _getLendingSummaryInformation(in, out);

        return out;

    }

    private AcctSmryInqrySvcMbrOut _setMemberInformation(AcctSmryInqrySvcIn in, AcctSmryInqrySvcMbrOut out) throws BizApplicationException {

        Cust cust = _getCustMngr().getCust(in.getCustId());

        try {
            out.setAge(ActorTpEnum.INDIVIDUAL.getValue().equals(cust.getActorTypeCode()) ? cust.getAge() : null);
        } catch(BizApplicationException e) {
        	logger.error("ignore exception: ",e);
        }

        out.setLoinIdNbr(cust.getLoginIdNbr());
        out.setMobileNbr(cust.getRepresentingMobileNbr());

        return out;
    }

    private AcctSmryInqrySvcMbrOut _setCustomerGrade(AcctSmryInqrySvcIn in, AcctSmryInqrySvcMbrOut out) throws BizApplicationException {

        Cust cust = _getCustMngr().getCust(in.getCustId());

        out.setCustGradeKndTpCd(cust.getCustGradeCode(CustGradeKndTpEnum.P2P_LOAN_RATING.getValue()));

        return out;
    }

    private AcctSmryInqrySvcMbrOut _getLoanSummaryInformation(AcctSmryInqrySvcIn in, AcctSmryInqrySvcMbrOut out) throws BizApplicationException {

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

        String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
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

    private AcctSmryInqrySvcMbrOut _getLendingSummaryInformation(AcctSmryInqrySvcIn in, AcctSmryInqrySvcMbrOut out2) throws BizApplicationException {

        BigDecimal totInvstmntCnt = BigDecimal.ZERO;
        BigDecimal totInvstmntAmt = BigDecimal.ZERO;
        BigDecimal invstmntBiddingCnt = BigDecimal.ZERO;
        BigDecimal invstmntBiddingSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntWinningBidCnt = BigDecimal.ZERO;
        BigDecimal invstmntWinningBidSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntFailureBidCnt = BigDecimal.ZERO;
        BigDecimal invstmntFailureBidSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntAbandonBidCnt = BigDecimal.ZERO;
        BigDecimal invstmntAbandonBidSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntCollectionCnt = BigDecimal.ZERO;
        BigDecimal invstmntCollectionSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntTrmntCnt = BigDecimal.ZERO;
        BigDecimal invstmntTrmntSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntPaybackOfPrncplSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntBalSumAmt = BigDecimal.ZERO;
        BigDecimal expctdLossSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntProfitSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntBidSucssRt = BigDecimal.ZERO;
        BigDecimal rtrnOnInvstmnt = BigDecimal.ZERO;
        BigDecimal averageInvstmntAmt = BigDecimal.ZERO;
        BigDecimal totInvstmntExpctdProfitSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdProfitRmngAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;

        List<ArrReal> arrLendingList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), null, in.getInqryStartDt(), in.getInqryEndDt());

        for(ArrReal arrLending : arrLendingList) {
            String strCntrtAmt = _getArrCndInqryBizProc().getArrangementConditionValue(arrLending.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));	// Contract Amount
            String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arrLending.getArrCnd(PdCndEnum.CURRENCY.getValue()));			// Currency
            BigDecimal cntrtAmt = new BigDecimal(strCntrtAmt);

            // Lending Balance
            ArrBal arrBal = _getArrBalMngr().getArrBal(arrLending, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
            BigDecimal balAmt = arrBal.getLastBal();

            // Overdue Principal Amount
            BigDecimal ovrDueAmt = BigDecimal.ZERO;
            ArrReal arrLoan = arrLending.getMthrArr();
            if(_getArrCashFlowMngr().isOverDue((Arr) arrLoan, _getCmnContext().getTxDate())) {
                ovrDueAmt = balAmt;
            }

            // Total Repayments Amount
            BigDecimal arrPayBackPrincipal = _getArrBalMngr().getArrBal(arrLending, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd).getLastBal();
            BigDecimal arrProfit = _getArrBalMngr().getArrBal(arrLending, AmtTpEnum.DVDND_INCOME.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd).getLastBal();

            if(arrLending.getArrSts().equals(ArrStsEnum.APPLIED)) {	// Bidding Lending Count and Contract Amount
                invstmntBiddingCnt = invstmntBiddingCnt.add(BigDecimal.ONE);
                invstmntBiddingSumAmt = invstmntBiddingSumAmt.add(cntrtAmt);
            }

            if(arrLending.getArrSts().equals(ArrStsEnum.FAILURE)) {	// Failure Bid Count and Contract Amount
                invstmntFailureBidCnt = invstmntFailureBidCnt.add(BigDecimal.ONE);
                invstmntFailureBidSumAmt = invstmntFailureBidSumAmt.add(cntrtAmt);
            }

            if(arrLending.getArrSts().equals(ArrStsEnum.ABANDONED)) {	// Abandoned Bid Count and Contract Amount
                invstmntAbandonBidCnt = invstmntAbandonBidCnt.add(BigDecimal.ONE);
                invstmntAbandonBidSumAmt = invstmntAbandonBidSumAmt.add(cntrtAmt);
            }

            if(arrLending.getArrSts().equals(ArrStsEnum.TERMINATED)) {	// Terminate Lending Count and Contract Amount
                invstmntTrmntCnt = invstmntTrmntCnt.add(BigDecimal.ONE);
                invstmntTrmntSumAmt = invstmntTrmntSumAmt.add(cntrtAmt);
                invstmntPaybackOfPrncplSumAmt = invstmntPaybackOfPrncplSumAmt.add(arrPayBackPrincipal);
                invstmntProfitSumAmt = invstmntProfitSumAmt.add(arrProfit);
            }

            if(arrLending.getArrSts().equals(ArrStsEnum.ACTIVE)) {		// Collection Lending Count and Amount
                invstmntCollectionCnt = invstmntCollectionCnt.add(BigDecimal.ONE);
                invstmntCollectionSumAmt = invstmntCollectionSumAmt.add(cntrtAmt);
                invstmntBalSumAmt = invstmntBalSumAmt.add(balAmt);
                expctdLossSumAmt = expctdLossSumAmt.add(ovrDueAmt);
                invstmntPaybackOfPrncplSumAmt = invstmntPaybackOfPrncplSumAmt.add(arrPayBackPrincipal);
                invstmntProfitSumAmt = invstmntProfitSumAmt.add(arrProfit);

                // Get lending cash flow
                List<ArrCashFlowIO> cashFlowList = _getP2PDvdndCalculator().getInvestmentCashFlowSchedule(arrLending);

                for(ArrCashFlowIO cashFlowIO : cashFlowList) {
                    if(cashFlowIO.getRpymntStsCd().equals(RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue())) {
                        if(cashFlowIO.getAmtTpCd().equals(AmtTpEnum.LN_NORMAL_INT.getValue())) {
                            BigDecimal rpymntSchdldAmt = cashFlowIO.getRpymntSchdldAmt();
                            invstmntExpctdProfitRmngAmt = invstmntExpctdProfitRmngAmt.add(rpymntSchdldAmt);
                        }
                    }
                }

            }
        }	// end of for

        // Lending Success Count and Amount = In Collection Lending + Terminate Lending
        invstmntWinningBidCnt = invstmntCollectionCnt.add(invstmntTrmntCnt);
        invstmntWinningBidSumAmt = invstmntCollectionSumAmt.add(invstmntTrmntSumAmt);

        // Lending Total Count and Amount = Bidding Lending + Success Lending + Failure Bid Lending
        // Except Abandoned Lending
        totInvstmntCnt = invstmntBiddingCnt.add(invstmntWinningBidCnt.add(invstmntFailureBidCnt));
        totInvstmntAmt = invstmntBiddingSumAmt.add(invstmntWinningBidSumAmt.add(invstmntFailureBidSumAmt));

        // Total Expected Profit Amount
        totInvstmntExpctdProfitSumAmt = invstmntExpctdProfitRmngAmt.add(invstmntWinningBidSumAmt);
        // Bid Success Rate = Bidding Count / Total Investment Count
        if(totInvstmntCnt.compareTo(BigDecimal.ZERO) > 0) {
            invstmntBidSucssRt = invstmntWinningBidCnt.divide(totInvstmntCnt, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
        }
        // Return on investment = Profit Sum Amount / Bidding Amount
        if(invstmntWinningBidSumAmt.compareTo(BigDecimal.ZERO) > 0) {
            rtrnOnInvstmnt = invstmntProfitSumAmt.divide(invstmntWinningBidSumAmt, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
        }
        // Average investment amount = Lending Total Amount / Lending Total Count
        if(totInvstmntCnt.compareTo(BigDecimal.ZERO) > 0) {
            averageInvstmntAmt = totInvstmntAmt.divide(totInvstmntCnt, BigDecimal.ROUND_HALF_UP);
        }
        // Total Expected Profit Amount and Return On Investment
        if(invstmntWinningBidSumAmt.compareTo(BigDecimal.ZERO) > 0) {
            invstmntExpctdRtrnOnInvstmnt = totInvstmntExpctdProfitSumAmt.divide(invstmntWinningBidSumAmt, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        out2.setTotInvstmntCnt(totInvstmntCnt);
        out2.setTotInvstmntAmt(totInvstmntAmt);
        out2.setInvstmntBiddingCnt(invstmntBiddingCnt);
        out2.setInvstmntBiddingSumAmt(invstmntBiddingSumAmt);
        out2.setInvstmntWinBidCnt(invstmntWinningBidCnt);
        out2.setInvstmntWinBidSumAmt(invstmntWinningBidSumAmt);
        out2.setInvstmntFailrBidCnt(invstmntFailureBidCnt);
        out2.setInvstmntFailrBidSumAmt(invstmntFailureBidSumAmt);
        out2.setInvstmntAbandonBidCnt(invstmntAbandonBidCnt);
        out2.setInvstmntAbandonBidSumAmt(invstmntAbandonBidSumAmt);
        out2.setInvstmntClctnCnt(invstmntCollectionCnt);
        out2.setInvstmntClctnSumAmt(invstmntCollectionSumAmt);
        out2.setInvstmntTrmntCnt(invstmntTrmntCnt);
        out2.setInvstmntTrmntSumAmt(invstmntTrmntSumAmt);
        out2.setInvstmntPaybackOfPrncplSumAmt(invstmntPaybackOfPrncplSumAmt);
        out2.setInvstmntBalSumAmt(invstmntBalSumAmt);
        out2.setExpctdLossSumAmt(expctdLossSumAmt);
        out2.setInvstmntProfitSumAmt(invstmntProfitSumAmt);
        out2.setInvstmntBidSucssRt(invstmntBidSucssRt);
        out2.setRtrnOnInvstmntRt(rtrnOnInvstmnt);
        out2.setAvgInvstmntAmt(averageInvstmntAmt);
        out2.setTotInvstmntExpctdProfitSumAmt(totInvstmntExpctdProfitSumAmt);
        out2.setInvstmntExpctdProfitRmndAmt(invstmntExpctdProfitRmngAmt);
        out2.setInvstmntExpctdRtrnOnInvstmntRt(invstmntExpctdRtrnOnInvstmnt);

        return out2;
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
     * @return the arrCndInqryBizProc
     */
    private ArrCndInqryBizProc _getArrCndInqryBizProc() {
        if (arrCndInqryBizProc == null) {
            arrCndInqryBizProc = (ArrCndInqryBizProc) CbbApplicationContext.getBean(
                    ArrCndInqryBizProc.class, arrCndInqryBizProc);
        }
        return arrCndInqryBizProc;
    }

    /**
     * @return the custMngr
     */
    private CustMngr _getCustMngr() {
        if (custMngr == null) {
            custMngr = (CustMngr) CbbApplicationContext.getBean(CustMngr.class, custMngr);
        }
        return custMngr;
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
     * @return the cmnContext
     */
    private CmnContext _getCmnContext() {
        if (cmnContext == null) {
            cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
        }
        return cmnContext;
    }

    /**
     * @return the custInfoInqryBizProc
     */
    private CustInfoInqryBizProc _getCustInfoInqryBizProc() {
        if (custInfoInqryBizProc == null) {
            custInfoInqryBizProc = (CustInfoInqryBizProc) CbbApplicationContext.getBean(
                    CustInfoInqryBizProc.class, custInfoInqryBizProc);
        }
        return custInfoInqryBizProc;
    }

    /**
     * @return the dvdndCalculatorP2P
     */
    private P2PDvdndCalculator _getP2PDvdndCalculator() {
        if (p2PDvdndCalculator == null) {
            p2PDvdndCalculator = (P2PDvdndCalculator) CbbApplicationContext.getBean(
            		P2PDvdndCalculator.class, p2PDvdndCalculator);
        }
        return p2PDvdndCalculator;
    }
}
