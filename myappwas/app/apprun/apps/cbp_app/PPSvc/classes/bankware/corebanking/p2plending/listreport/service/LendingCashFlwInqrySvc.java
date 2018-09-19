package bankware.corebanking.p2plending.listreport.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrP2pMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.listreport.service.dto.CashFlow;
import bankware.corebanking.p2plending.listreport.service.dto.LendingCashFlowInqrySvcIn;
import bankware.corebanking.p2plending.listreport.service.dto.LendingCashFlowInqrySvcOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.settlement.amountcalculator.interfaces.P2PDvdndCalculator;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;

/**
 * 이 서비스는 상환스케줄 정보를 조회한다.
 * This service allows to inquire Cash Flow information of arrangement
 *
 * Author	Hokeun Lee
 * History
 */
@BxmService("LendingCashFlwInqrySvc")
@CbbClassInfo(classType={"SERVICE"})
@BxmCategory(logicalName = "Monthly Lending or Loan Cash Flow Information Inquiry", description = "Monthly Lending Collection / Loan Repayment Amount Information Inquiry")
public class LendingCashFlwInqrySvc {
    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private CmnContext			cmnContext;			// Common context
    private ArrCustMngr			arrCustMngr;		// Arrangement customer manager
    private ArrP2pMngr			arrP2pMngr;			// Arrangement P2P manager
    private ArrCashFlowMngr		arrCashFlowMngr;	// Arrangement cash flow manager
    private P2PDvdndCalculator  	p2PDvdndCalculator;	// Dividend Calculator P2P Interface
    private Cd 	   			   	cd;					// Code

    /**
     * Lending / Loan  Cash Flow Inquiry
     * <pre>
     * flow description
     *
     * 1. Check default value
     *
     * 2. If the input value is 'Loan', it get the loan repayments schedule
     *    2.1 Get loan arrangement information by customer id
     *    2.2 Get loan repayments schedule information
     *    2.3 Assemble Monthly loan cash flow
     *
     * 3. Else the input value is 'Lending', it get the lending collection schedule
     *    3.1 Get lending arrangement information by customer id
     *    3.2 Get lending collection schedule information
     *    3.3 Assemble monthly lending cash flow
     *
     * 4. Generate output data
     *
     * </pre>
     * @param in (required) LendingCashFlowInqrySvcIn: Customer identification, Inquiry start date, Inquiry end date, Loan yes or no
     * @return LendingCashFlowInqrySvcOut Cash flow list
     * @throws BizApplicationException
     */
    @CbbSrvcInfo(srvcCd="SPP2080400", srvcNm="Monthly Lending or Loan Cash Flow Inquiry", srvcAbrvtnNm="getCashFlw" )
    @BxmCategory(logicalName = "Get Monthly Lending or Loan Cash Flow Inquiry")
    @BxmServiceOperation("getCashFlow")
    public LendingCashFlowInqrySvcOut getCashFlow(LendingCashFlowInqrySvcIn in) throws BizApplicationException {

        /**
         * Validate the input value
         */
        _validateInput(in);

        /**
         * Get ArrReal List
         */
        List<ArrReal> arrRealList = _getArrRealList(in);

        /**
         * Assemble monthly lending cash flow
         */
        if(CCM01.YES.equals(in.getLnYn())) {
            return _outputCashFlow(arrRealList, in);
        }
        return _outputInvestmentCashFlow(arrRealList, in);
    }

    private void _validateInput(LendingCashFlowInqrySvcIn in) throws BizApplicationException {

        if(in.getCustId() == null || in.getCustId().isEmpty()) {
            in.setCustId(_getCmnContext().getCustId());
        }

        if(in.getInqryStartDt() == null || in.getInqryStartDt().isEmpty()) {
            in.setInqryStartDt(CCM01.MIN_DATE);
        }

        if(in.getInqryEndDt() == null || in.getInqryEndDt().isEmpty()) {
            in.setInqryEndDt(CCM01.MAX_DATE);
        }
    }

    private List<ArrReal> _getArrRealList(LendingCashFlowInqrySvcIn in) throws BizApplicationException {

        if(CCM01.YES.equals(in.getLnYn())) {
            String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출

            return _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), ArrStsEnum.ACTIVE, bizDscd, null, null, null);
        } else {
            return _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), ArrStsEnum.ACTIVE, in.getInqryStartDt(), in.getInqryEndDt());
        }
    }

    private LendingCashFlowInqrySvcOut _outputCashFlow(List<ArrReal> arrRealList, LendingCashFlowInqrySvcIn in) throws BizApplicationException {

        LendingCashFlowInqrySvcOut out = new LendingCashFlowInqrySvcOut();

        Map<String, CashFlow> map = new HashMap<String, CashFlow>();
        BigDecimal expectedAmt = BigDecimal.ZERO;
        BigDecimal txAmt = BigDecimal.ZERO;

        for(ArrReal arrReal : arrRealList) {
            List<ArrCashFlowIO> cashFlowList = _getArrCashFlowMngr().getArrCashFlowSchedule((Arr)arrReal);

            for(ArrCashFlowIO cashFlowItm : cashFlowList) {
                CashFlow cashFlow = new CashFlow();

                if(cashFlowItm.getRpymntStsCd().equals(RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue())) {
                    expectedAmt = expectedAmt.add(cashFlowItm.getRpymntSchdldAmt());
                } else {
                    txAmt = txAmt.add(cashFlowItm.getRpymntSchdldAmt());
                }

                cashFlow.setRpymntStsCd(cashFlowItm.getRpymntStsCd());
                cashFlow.setRpymntStsNm(_getCd().getCode("50043", cashFlowItm.getRpymntStsCd()));
                cashFlow.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt());
                cashFlow.setRpymntCyclNbr(cashFlowItm.getRpymntCyclNbr());
                cashFlow.setRpymntSchdldAmt(cashFlowItm.getRpymntSchdldAmt());
                cashFlow.setArrId(cashFlowItm.getArrId());

                if(map.get(cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt()) == null) {
                    map.put(cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt(), cashFlow);
                } else {
                    CashFlow tmpCashFlow = map.get(cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt());
                    tmpCashFlow.setRpymntSchdldAmt(tmpCashFlow.getRpymntSchdldAmt().add(cashFlowItm.getRpymntSchdldAmt()));
                    map.put(cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt(), tmpCashFlow);
                }
            }
        }

        List<CashFlow> cashFlowList = new ArrayList<CashFlow>();

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

        for (int i = 0; i < hmKeys.length; i++) {
             String key = (String) hmKeys[i];
             cashFlowList.add(map.get(key));
        }

        out.setExpctdAmt(expectedAmt);
        out.setTxAmt(txAmt);
        out.setCashFlwList(cashFlowList);

        return out;
    }

    private LendingCashFlowInqrySvcOut _outputInvestmentCashFlow(List<ArrReal> arrRealList, LendingCashFlowInqrySvcIn in) throws BizApplicationException {

        LendingCashFlowInqrySvcOut out = new LendingCashFlowInqrySvcOut();

        Map<String, CashFlow> map = new HashMap<String, CashFlow>();
        BigDecimal expectedAmt = BigDecimal.ZERO;
        BigDecimal txAmt = BigDecimal.ZERO;

        for(ArrReal arrReal : arrRealList) {
            List<ArrCashFlowIO> cashFlowList = _getP2PDvdndCalculator().getInvestmentCashFlowSchedule((Arr)arrReal);
            //List<ArrCashFlowIO> cashFlowList = arrCashFlowMngr.getArrCashFlowSchedule((Arr)arrReal);
            String arrId = arrReal.getArrId();
            for(ArrCashFlowIO cashFlowItm : cashFlowList) {
                CashFlow cashFlow = new CashFlow();

                if(cashFlowItm.getRpymntStsCd().equals(RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue())) {
                    expectedAmt = expectedAmt.add(cashFlowItm.getRpymntSchdldAmt());
                } else {
                    txAmt = txAmt.add(cashFlowItm.getRpymntSchdldAmt());
                }

                cashFlow.setRpymntStsCd(cashFlowItm.getRpymntStsCd());
                cashFlow.setRpymntStsNm(_getCd().getCode("50043", cashFlowItm.getRpymntStsCd()));
                cashFlow.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt());
                cashFlow.setRpymntCyclNbr(cashFlowItm.getRpymntCyclNbr());
                cashFlow.setRpymntSchdldAmt(cashFlowItm.getRpymntSchdldAmt());
                cashFlow.setArrId(arrId);

                if(map.get(arrId + cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt()) == null) {
                    map.put(arrId + cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt(), cashFlow);
                } else {
                    CashFlow tmpCashFlow = map.get(arrId + cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt());
                    tmpCashFlow.setRpymntSchdldAmt(tmpCashFlow.getRpymntSchdldAmt().add(cashFlowItm.getRpymntSchdldAmt()));
                    map.put(arrId + cashFlowItm.getRpymntStsCd() + cashFlowItm.getRpymntSchdldDt(), tmpCashFlow);
                }
            }
        }

        List<CashFlow> cashFlowList = new ArrayList<CashFlow>();

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

        for (int i = 0; i < hmKeys.length; i++) {
             String key = (String) hmKeys[i];
             cashFlowList.add(map.get(key));
        }

        out.setExpctdAmt(expectedAmt);
        out.setTxAmt(txAmt);
        out.setCashFlwList(cashFlowList);

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
     * @return the arrP2pMngr
     */
    private ArrP2pMngr _getArrP2pMngr() {
        if (arrP2pMngr == null) {
            arrP2pMngr = (ArrP2pMngr) CbbApplicationContext.getBean(ArrP2pMngr.class, arrP2pMngr);
        }
        return arrP2pMngr;
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
     * @return the cd
     */
    private Cd _getCd() {
        if (cd == null) {
            cd = (Cd) CbbApplicationContext.getBean(Cd.class, cd);
        }
        return cd;
    }
}
