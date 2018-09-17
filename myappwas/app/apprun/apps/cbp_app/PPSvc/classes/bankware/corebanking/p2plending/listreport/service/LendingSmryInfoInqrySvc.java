package bankware.corebanking.p2plending.listreport.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrP2pMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.listreport.service.dto.LendingSmryInfoInqrySvcLendingSmryInfoIn;
import bankware.corebanking.p2plending.listreport.service.dto.LendingSmryInfoInqrySvcLendingSmryInfoOut;
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

/**
 * 이 서비스는 투자 요약 정보를 조회한다.
 * This service allows to inquire Lending Summary Information by Customer Identification
 *
 * Author	Hokeun Lee
 * History
 */
@BxmService("LendingSmryInfoInqrySvc")
@CbbClassInfo(classType={"SERVICE"})
@BxmCategory(logicalName = "Lending Summary Information Inquiry", description = "Lending Summary Information Inquiry")
public class LendingSmryInfoInqrySvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private CmnContext 			cmnContext;				// Common context
    private ArrP2pMngr			arrP2pMngr;				// Arrangement P2P manager
    private ArrBalMngr			arrBalMngr;				// Arrangement balance manager
    private ArrCashFlowMngr		arrCashFlowMngr;		// Arrangement cash flow manager
    private ArrCndInqryBizProc	arrCndInqryBizProc;		// Arrangement condition inquiry bizproc
    private P2PDvdndCalculator  	p2PDvdndCalculator; 	// Dividend Calculator P2P Interface

    /**
     * Lending Summary Information by Customer Identification
     * 고객 식별자를 이용하여 투자 요약 정보를 조회한다.
     *
     * <pre>
     * flow description
     *
     * 1. Set default value
     *    1.1 Set Customer Identification when it is null
     *
     * 2. Loop The number of Lending arrangement
     *    3.1 Get Lending arrangement information by arrangement identification
     *    3.2 Assemble arrangement Status Specific Count and Summary Loan Amount
     *      3.2.1 Assemble arrangement Count and Summary Lending amount if Arrangement Status Code is 'D:Start Bidding'
     *      3.2.2 Assemble arrangement Count and Summary Lending amount if Arrangement Status Code is 'F:Failure Bid'
     *      3.2.3 Assemble arrangement Count and Summary Lending amount, Loan Balance, Principal Amount, Overdue Principal Amount, Overdue Interest Amount if Arrangement Status Code is 'A:Active'
     *      3.2.4 Assemble arrangement Count and Summary Lending amount if Arrangement Status Code is 'T:Terminate'
     *
     * 3. Build Output data
     *    3.1 Output data generation
     *
     * </pre>
     * @param in (required) LendingSmryInfoInqrySvcLendingSmryInfoIn : Customer identification, Arrangement status code, Inquiry start & end date
     * @return LendingSmryInfoInqrySvcLendingSmryInfoOut Lending Summary Information
     * @throws BizApplicationException
     */
    @CbbSrvcInfo(srvcCd="SPP4070401", srvcNm="Lending Summary Information Inquiry")
    @BxmCategory(logicalName = "Lending Summary Information Inquiry")
    @BxmServiceOperation("getLendingSummaryInformation")
    public LendingSmryInfoInqrySvcLendingSmryInfoOut getLendingSummaryInformation(LendingSmryInfoInqrySvcLendingSmryInfoIn in) throws BizApplicationException{

        /**
         * Set the default value
         */
        _setDefaultValue(in);

        /**
         * Get Lending arrangement information by customer identification
         * and assemble Information the number of Lending arrangement.
         */
        LendingSmryInfoInqrySvcLendingSmryInfoOut out = _getLendingSummaryInformation(in);

        return out;
    }

    private void _setDefaultValue(LendingSmryInfoInqrySvcLendingSmryInfoIn in) throws BizApplicationException {

        if(in.getCustId() == null || in.getCustId().isEmpty()) {
            in.setCustId(_getCmnContext().getCustId());
        }

        if(in.getInqryStartDt() == null || StringUtils.isEmpty(in.getInqryStartDt())){
            in.setInqryStartDt(CCM01.MIN_DATE);
        }

        if(in.getInqryEndDt() == null || StringUtils.isEmpty(in.getInqryEndDt())){
            in.setInqryEndDt(CCM01.MAX_DATE);
        }
    }

    private LendingSmryInfoInqrySvcLendingSmryInfoOut _getLendingSummaryInformation(LendingSmryInfoInqrySvcLendingSmryInfoIn in) throws BizApplicationException {

        LendingSmryInfoInqrySvcLendingSmryInfoOut out = new LendingSmryInfoInqrySvcLendingSmryInfoOut();

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
            // 2016.03.08 오윤화  금액유형코드 변경에 따른 수정
            //BigDecimal arrProfit = arrBalMngr.getArrBal(arrLending, AmtTpEnum.INT.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd).getLastBal();
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
            invstmntExpctdRtrnOnInvstmnt = totInvstmntExpctdProfitSumAmt.divide(invstmntWinningBidSumAmt, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        out.setTotInvstmntCnt(totInvstmntCnt);
        out.setTotInvstmntAmt(totInvstmntAmt);
        out.setInvstmntBiddingCnt(invstmntBiddingCnt);
        out.setInvstmntBiddingSumAmt(invstmntBiddingSumAmt);
        out.setInvstmntWinBidCnt(invstmntWinningBidCnt);
        out.setInvstmntWinBidSumAmt(invstmntWinningBidSumAmt);
        out.setInvstmntFailrBidCnt(invstmntFailureBidCnt);
        out.setInvstmntFailrBidSumAmt(invstmntFailureBidSumAmt);
        out.setInvstmntAbandonBidCnt(invstmntAbandonBidCnt);
        out.setInvstmntAbandonBidSumAmt(invstmntAbandonBidSumAmt);
        out.setInvstmntClctnCnt(invstmntCollectionCnt);
        out.setInvstmntClctnSumAmt(invstmntCollectionSumAmt);
        out.setInvstmntTrmntCnt(invstmntTrmntCnt);
        out.setInvstmntTrmntSumAmt(invstmntTrmntSumAmt);
        out.setInvstmntPaybackOfPrncplSumAmt(invstmntPaybackOfPrncplSumAmt);
        out.setInvstmntBalSumAmt(invstmntBalSumAmt);
        out.setExpctdLossSumAmt(expctdLossSumAmt);
        out.setInvstmntProfitSumAmt(invstmntProfitSumAmt);
        out.setInvstmntBidSucssRt(invstmntBidSucssRt);
        out.setRtrnOnInvstmntRt(rtrnOnInvstmnt);
        out.setAvgInvstmntAmt(averageInvstmntAmt);
        out.setTotInvstmntExpctdProfitSumAmt(totInvstmntExpctdProfitSumAmt);
        out.setInvstmntExpctdProfitRmndAmt(invstmntExpctdProfitRmngAmt);
        out.setInvstmntExpctdRtrnOnInvstmntRt(invstmntExpctdRtrnOnInvstmnt);

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
     * @return the arrP2pMngr
     */
    private ArrP2pMngr _getArrP2pMngr() {
        if (arrP2pMngr == null) {
            arrP2pMngr = (ArrP2pMngr) CbbApplicationContext.getBean(ArrP2pMngr.class, arrP2pMngr);
        }
        return arrP2pMngr;
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
