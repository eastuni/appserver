package bankware.corebanking.p2plending.reserveagreement.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrP2pMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.creation.bizproc.ArrCrtnBizProc;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcGetCshflwSmltnIn;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcGetCshflwSmltnOut;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcRevenueOut;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingProfitSmltnSvcIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingProfitSmltnSvcOut;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.amountcalculator.interfaces.P2PDvdndCalculator;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 투자 수익 계산을 제공합니다.
 * This service calculates revenue from lending
 *
 * Author	
 * History
 *  2016.02.18	initial version for 3.0
 */
@BxmCategory(logicalName = "Lending Profit Simulation")
@CbbClassInfo(classType = "SERVICE")
@BxmService("LendingProfitSmltnSvc")
public class LendingProfitSmltnSvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private P2PDvdndCalculator  	p2PDvdndCalculator;	// Dividend Calculator P2P Interface
    private CmnContext			cmnContext;			// Common context
    private ArrP2pMngr			arrP2pMngr;			// Arrangement P2P manager
    private ArrCndInqryBizProc	arrCndInqryBizProc;	// Arrangement condition inquiry bizproc
    private ArrCrtnBizProc		arrCrtnBizProc;		// Arrangement creation bizproc

    /**
     * 투자수익을 시뮬레이션한다.
     * Simulate the lending profit.
     * <pre>
     * flow description
     *
     * 1. Calculate Lending Revenue
     *
     * 2. Get Lending Arrangement Virtual Fee
     *
     * 3. Assemble the output & return
     * </pre>
     *
     * @param in (required) LendingProfitSmltnSvcIn: Information for lending profit simulation
     * @return LendingProfitSmltnSvcOut Simulation result
     * @throws BizApplicationException
     */
    @BxmServiceOperation("simulateLendingProfit")
    @BxmCategory(logicalName = "Lending Profit Simulation")
    @CbbSrvcInfo(srvcCd = "SPP2050401", srvcNm = "Lending Profit Simulation")
    @TransactionalOperation
    public LendingProfitSmltnSvcOut simulateLendingProfit(LendingProfitSmltnSvcIn in) throws BizApplicationException {

        /**
         * Calculate Lending Revenue
         */
        CshflwSmltnSvcGetCshflwSmltnOut revenueList = _calculateLendingRevenue(in);

        // Include lending profit revenue
        if(in.getLoanAgrmntIn()!= null && CCM01.YES.equals(in.getLoanAgrmntIn().getExstngInvstmntContainYn())){
            _getExistingInvestmentContainSchedule(revenueList);
        }

        /**
         * Get Lending Arrangement Virtual Fee
         */
        //List<FeeCalculatorOut> feeCalculatorOutList = _getLendingFeeList(in);

        /**
         * Assemble the output & return
         */
        //return _buildOutput(revenueList, feeCalculatorOutList);
        return _buildOutput(revenueList);
    }

    /**
     * Get Lending Arrangement Virtual Fee
     * @param in (required) LendingProfitSmltnSvcIn
     * @return  CshflwSmltnSvcGetCshflwSmltnOut
     * @throws BizApplicationException
     */
    private CshflwSmltnSvcGetCshflwSmltnOut _calculateLendingRevenue(LendingProfitSmltnSvcIn in)  throws BizApplicationException {

        CshflwSmltnSvcGetCshflwSmltnIn cshflwSmltnIn = new CshflwSmltnSvcGetCshflwSmltnIn();
        cshflwSmltnIn.setPdCd(in.getCshflwSmltnIn().getPdCd());
        cshflwSmltnIn.setAplctnAmt(in.getCshflwSmltnIn().getAplctnAmt());
        cshflwSmltnIn.setLonAprvlTrmCnt(in.getCshflwSmltnIn().getLonAprvlTrmCnt());
        cshflwSmltnIn.setBsicIntRt(in.getCshflwSmltnIn().getBsicIntRt());
        cshflwSmltnIn.setArrDt(in.getCshflwSmltnIn().getArrDt());

        CshflwSmltnSvcGetCshflwSmltnOut revenueList = CbbInternalServiceExecutor.execute("SPP2050404", cshflwSmltnIn);

        return revenueList;
    }

    /**
     * Get Lending Arrangement Virtual Fee
     * @param in (required) LendingProfitSmltnSvcIn
     * @return List<FeeCalculatorOut>
     * @throws BizApplicationException
     */
    private void _getExistingInvestmentContainSchedule(CshflwSmltnSvcGetCshflwSmltnOut out) throws BizApplicationException {

        if(_getCmnContext().getCustId() != null && !_getCmnContext().getCustId().isEmpty()) {
            List<ArrReal> arrLendingList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(_getCmnContext().getCustId(), ArrStsEnum.ACTIVE, CCM01.MIN_DATE, CCM01.MAX_DATE);

            Map<String, CshflwSmltnSvcRevenueOut> map = new HashMap<String, CshflwSmltnSvcRevenueOut>();

            for(ArrReal arrLending : arrLendingList) {
                String arrId = arrLending.getArrId();
                List<ArrCashFlowIO> cashFlowList = _getP2PDvdndCalculator().getInvestmentCashFlowSchedule(arrLending);

                for(ArrCashFlowIO cashFlowItm : cashFlowList) {
                    if(RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue().equals(cashFlowItm.getRpymntStsCd())) {	// RPYMNT_STS_CD_1 : Not payed yet.
                        CshflwSmltnSvcRevenueOut cashFlow = new CshflwSmltnSvcRevenueOut();

                        cashFlow.setArrId(arrId);
                        cashFlow.setSeqNbr(cashFlowItm.getSeqNbr());
                        cashFlow.setAmtTpCd(cashFlowItm.getAmtTpCd());
                        cashFlow.setCalcnBaseAmt(cashFlowItm.getCalcnBaseAmt());
                        cashFlow.setSctnStartDt(cashFlowItm.getSctnStartDt());
                        cashFlow.setSctnEndDt(cashFlowItm.getSctnEndDt());
                        cashFlow.setAplyIntRt(cashFlowItm.getAplyIntRt());
                        cashFlow.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt());
                        cashFlow.setRpymntSchdldAmt(cashFlowItm.getRpymntSchdldAmt());
                        cashFlow.setRpymntCyclNbr(cashFlowItm.getRpymntCyclNbr());

                        CshflwSmltnSvcRevenueOut tmpCashFlow = map.get(arrId + cashFlowItm.getRpymntSchdldDt()+cashFlowItm.getRpymntCyclNbr());

                        if(tmpCashFlow == null) {
                            if (AmtTpEnum.PRNCPL.getValue().equals(cashFlowItm.getAmtTpCd())) {
                                cashFlow.setCalcnBaseAmt(cashFlowItm.getCalcnBaseAmt().subtract(cashFlowItm.getRpymntSchdldAmt()));
                                cashFlow.setPrncpl(cashFlowItm.getRpymntSchdldAmt()); // Principal amount
                            } else {
                                cashFlow.setIntAmt(cashFlowItm.getRpymntSchdldAmt()); // Interest amount
                            }
                            map.put(arrId + cashFlowItm.getRpymntSchdldDt()+cashFlowItm.getRpymntCyclNbr(), cashFlow);
                        }
                        else {
                            // 00000: Principal Amount, 10201: Interest
                            if (AmtTpEnum.PRNCPL.getValue().equals(cashFlowItm.getAmtTpCd())) {
                                tmpCashFlow.setCalcnBaseAmt(cashFlowItm.getCalcnBaseAmt().subtract(cashFlowItm.getRpymntSchdldAmt()));
                                tmpCashFlow.setPrncpl(cashFlowItm.getRpymntSchdldAmt()); // Principal amount
                                tmpCashFlow.setIntAmt(tmpCashFlow.getIntAmt());
                            } else {
                                tmpCashFlow.setPrncpl(tmpCashFlow.getPrncpl());
                                tmpCashFlow.setIntAmt(cashFlowItm.getRpymntSchdldAmt()); // Interest amount
                            }

                            tmpCashFlow.setRpymntSchdldAmt(tmpCashFlow.getRpymntSchdldAmt().add(cashFlowItm.getRpymntSchdldAmt()));
                            map.put(arrId + cashFlowItm.getRpymntSchdldDt()+cashFlowItm.getRpymntCyclNbr(), tmpCashFlow);
                        }
                    }
                }
            }

            Set<String> set = map.keySet();
            Object[] hmKeys = set.toArray();

            Comparator<Object> sorter = new Comparator<Object>() {
                public int compare(Object s1, Object s2) {

                    String ss1 = (String) s1;
                    String ss2 = (String) s2;

                    return (-1) * ss2.compareTo(ss1);
                }
            };

            Arrays.sort(hmKeys, sorter);

            List<CshflwSmltnSvcRevenueOut> cshflwSmltnSvcRevenueOuts = new ArrayList<CshflwSmltnSvcRevenueOut>();

            for (int i = 0; i < hmKeys.length; i++) {
                String key = (String) hmKeys[i];
                cshflwSmltnSvcRevenueOuts.add(map.get(key));
            }

            List<CshflwSmltnSvcRevenueOut> revenueList = out.getCshflwList();
            revenueList.addAll(cshflwSmltnSvcRevenueOuts);
            out.setCshflwList(revenueList);
        }
    }

    /**
     * Get Lending Arrangement Virtual Fee
     * @param in (required) LendingProfitSmltnSvcIn
     * @return  List<FeeCalculatorOut>
     * @throws BizApplicationException
     */
//    private List<FeeCalculatorOut> _getLendingFeeList(LendingProfitSmltnSvcIn in)  throws BizApplicationException {
//
//        List<FeeCalculatorOut> feeCalculatorOutList = new ArrayList<FeeCalculatorOut>();
//
//        if(in.getLendingAgrmntIn() != null){
//            /**
//             * Build virtual arrangement
//             */
//            ArrVrtl arrVrtl = _getArrCrtnBizProc().createVirtualArrangement(in.getLendingAgrmntIn());
//            /**
//             * Calculate Fee On Investing
//             */
//            FeeCalculatorOut biddingApplicationFee = _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.OPEN_P2P_INVESTMENT, arrVrtl);
//            feeCalculatorOutList.add(biddingApplicationFee);
//
//            /**
//             * Simulate Lending Arrangement Fee Calculation
//             */
//            FeeCalculatorOut biddingSuccessFee = _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.OPEN_LOAN, arrVrtl);
//            feeCalculatorOutList.add(biddingSuccessFee);
//        }
//
//        return feeCalculatorOutList;
//    }

    /**
     * Create Lending Transaction And Entry
     * @param arr 			(required) Arrangement
     * @param dpstAcct 		(required) Deposit account
     * @param feeCalculatorOut (required) Result of fee calculator
     * @return LendingProfitSmltnSvcOut
     * @throws BizApplicationException
     */
    //private LendingProfitSmltnSvcOut _buildOutput(CshflwSmltnSvcGetCshflwSmltnOut out, List<FeeCalculatorOut> feeCalculatorOutList) {
    private LendingProfitSmltnSvcOut _buildOutput(CshflwSmltnSvcGetCshflwSmltnOut out) {

        LendingProfitSmltnSvcOut lendingProfitSmltnSvcOut = new LendingProfitSmltnSvcOut();

        if(out != null){
            lendingProfitSmltnSvcOut.setRevenueList(out.getCshflwList());
        }

//        for(FeeCalculatorOut feeCalculatorOut : feeCalculatorOutList){
//            for(FeeCalcnVal feeCalcnVal : feeCalculatorOut.getFeeCalcnVal()){
//                //입찰신청 수수료
//                if(feeCalcnVal.getAmtTpCd().equals(AmtTpEnum.BIDDING_APLCTN_FEE.getValue())){
//                    lendingProfitSmltnSvcOut.setBiddingAplctnFeeAmt(feeCalcnVal.getFeeDcsnAmt());
//                //입찰성공 수수료
//                }else if(feeCalcnVal.getAmtTpCd().equals(AmtTpEnum.BIDDING_SUCSS_FEE.getValue())){
//                    lendingProfitSmltnSvcOut.setBiddingSucssFeeAmt(feeCalcnVal.getFeeDcsnAmt());
//                }
//            }
//        }

        return lendingProfitSmltnSvcOut;
    }

    /**
     * 투자 수수료를 시뮬레이트한다.
     * Simulate the lending fee.
     * <pre>
     * flow description
     *
     * 1. Get Lending Arrangement Virtual Fee
     *
     * 2. Assemble the output & return
     * </pre>
     * @param in (required) LendingProfitSmltnSvcIn: Information for lending fee simulation
     * @return LendingProfitSmltnSvcOut Simulation result
     * @throws BizApplicationException
     */
    @BxmServiceOperation("simulateLendingFee")
    @BxmCategory(logicalName = "Lending fee simulation")
    @CbbSrvcInfo(srvcCd = "SPP2050402", srvcNm = "Lending fee simulation")
    @TransactionalOperation
    public LendingProfitSmltnSvcOut simulateLendingFee(LendingProfitSmltnSvcIn in) throws BizApplicationException {

        /**
         * Get Lending Arrangement Virtual Fee
         */
        //List<FeeCalculatorOut> feeCalculatorOutList = _getLendingFeeList(in);

        /**
         * Assemble the output & return
         */
        //return _buildOutput(null, feeCalculatorOutList);
    	return _buildOutput(null);
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
     * @return the arrCrtnBizProc
     */
    private ArrCrtnBizProc _getArrCrtnBizProc() {
        if (arrCrtnBizProc == null) {
            arrCrtnBizProc = (ArrCrtnBizProc) CbbApplicationContext.getBean(
                    ArrCrtnBizProc.class, arrCrtnBizProc);
        }
        return arrCrtnBizProc;
    }
}
