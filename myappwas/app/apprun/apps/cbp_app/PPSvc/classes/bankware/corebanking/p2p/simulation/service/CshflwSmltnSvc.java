package bankware.corebanking.p2p.simulation.service;

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
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrVrtl;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrBsicCrtn;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrCrtnIn;
import bankware.corebanking.core.arrangement.arrangementcondition.interfaces.dto.ArrCndCrtn;
import bankware.corebanking.core.product.productapi.interfaces.Pd;
import bankware.corebanking.core.product.productapi.interfaces.PdMngr;
import bankware.corebanking.core.product.productapi.interfaces.dto.CndVal;
import bankware.corebanking.core.product.productapi.interfaces.dto.PdIn;
import bankware.corebanking.core.product.productapi.interfaces.dto.SmplListCndVal;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcGetCshflwSmltnIn;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcGetCshflwSmltnOut;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcRevenueOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * This service provides cash flow simulation that related product.
 *
 * Author	Kisu Kim
 * History
 *  2016.02.18	initial version for 3.0
 */
@BxmService("CshflwSmltnSvc")
@BxmCategory(logicalName = "Cashflow Simulation Service")
@CbbClassInfo(classType={"SERVICE"})
public class CshflwSmltnSvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private CmnContext		cmnContext;			// Common Context
    private ArrCashFlowMngr	arrCashFlowMngr;	// Arrangement Cash Flow Manager
    private ArrMngr			arrMngr;			// Arrangement Manager
    private PdMngr			pdMngr;				// Product Manager

    /**
     * 캐시플로우 시뮬레이션.
     * Simulate the cash flow.
     *
     * <pre>
     * 1. 가상계약을 만들기 위한 조건을 셋팅한다.
     * 	1.1 상품코드를 이용해 상품을 가져온다.
     * 	1.2 가상 계약 생성을 위한 DTO에 기본 정보 및 조건값을 설정한다.(상품 코드, 계약 일자, 계약 금액, 계약 기간, 이율, 상환 방법 등...)
     *
     * 1. Set the condition for making virtual arrangement.
     * 	1.1 Get the product using product code.
     * 	1.2 Set the basic & condition values. (Product code, Arrangement date, Contract amount, Contract term, Interest rate, Repayment method, Installment Repayment After Partial Repayment)
     *
     * 2. 가상 계약을 생성한다.
     *
     * 2. Create the virtual arrangement.
     *
     * 3. 가상 계약을 이용해 캐시플로우를 생성한다.
     *
     * 3. Create the cash flow using virtual arrangement.
     *
     * 4. 출력을 조립하고 반환한다.
     * 	4.1 캐시플로우를 날짜순으로 정렬한다.
     *
     * 4. Assemble the output & return
     * 	4.1 Sort the cash flow by date.
     * </pre>
     *
     * @param in (required) CshflwSmltnSvcGetCshflwSmltnIn: Basic information for creating cash flow.
     * @return CshflwSmltnSvcGetCshflwSmltnOut Cash flow information
     * @throws BizApplicationException
     */
    @BxmServiceOperation("simulateCashflow")
    @CbbSrvcInfo(srvcCd="SPP2050404", srvcNm="Simulate Cashflow")
    @BxmCategory(logicalName = "Simulate Cashflow")
    @TransactionalOperation
    public CshflwSmltnSvcGetCshflwSmltnOut simulateCashflow(CshflwSmltnSvcGetCshflwSmltnIn in) throws BizApplicationException {

        /**
         * Set the condition for making virtual arrangement
         */
        ArrCrtnIn arrCrtnIn = _setCondition(in);

        /**
         * Create the virtual arrangement
         */
        ArrVrtl arrVrtl = _getArrMngr().openArrVrtl(arrCrtnIn);

        /**
         * Create the cash flow
         */
        List<ArrCashFlowIO> arrCashFlowList = _getArrCashFlowMngr().generateArrCashFlowSchedule(arrVrtl);

        /**
         * Assemble the output & return
         */
        return _assembleOutput(arrCashFlowList);
    }

    private ArrCrtnIn _setCondition(CshflwSmltnSvcGetCshflwSmltnIn in) throws BizApplicationException {

        ArrCrtnIn arrCrtnIn 	= new ArrCrtnIn();
        ArrBsicCrtn arrBsicCrtn = new ArrBsicCrtn();
        String arrDt 			= StringUtils.isEmpty(in.getArrDt())? _getCmnContext().getTxDate(): in.getArrDt();

        // Get the product
        PdIn pdIn = new PdIn();

        pdIn.setPdCd(in.getPdCd());
        pdIn.setAplyDt(arrDt);

        Pd pd = _getPdMngr().getPd(pdIn);

        // Set the basic information
        arrBsicCrtn.setPdCd(in.getPdCd());
        arrBsicCrtn.setCrtnEfctvDt(arrDt);

        // Set the condition
        List<ArrCndCrtn> arrCndCrtnList = new ArrayList<ArrCndCrtn>();

        ArrCndCrtn arrCndCrtn = new ArrCndCrtn();
        arrCndCrtn.setCndCd(PdCndEnum.CONTRACT_AMOUNT.getValue());
        arrCndCrtn.setTxtCndVal(String.valueOf(in.getAplctnAmt()));
        arrCndCrtnList.add(arrCndCrtn);

        arrCndCrtn = new ArrCndCrtn();
        arrCndCrtn.setCndCd(PdCndEnum.CONTRACT_TERM.getValue());
        arrCndCrtn.setTxtCndVal(String.valueOf(in.getLonAprvlTrmCnt()));
        arrCndCrtnList.add(arrCndCrtn);

        arrCndCrtn = new ArrCndCrtn();
        arrCndCrtn.setCndCd(PdCndEnum.P2P_INT_RT.getValue());
        arrCndCrtn.setTxtCndVal(String.valueOf(in.getBsicIntRt()));
        arrCndCrtnList.add(arrCndCrtn);

        arrCndCrtn = new ArrCndCrtn();
        arrCndCrtn.setCndCd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue());
        CndVal cndVal = pd.getCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()).getCndVal();
        if(cndVal == null) {
            // Condition cannot be found. Please check input value.
            throw new BizApplicationException("AAPPDE0005", null);
        }
        String txCndVal = ((SmplListCndVal) pd.getCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()).getCndVal()).getBsicVal();
        if(StringUtils.isEmpty(txCndVal)) {
            // Condition cannot be found. Please check input value.
            throw new BizApplicationException("AAPPDE0005", null);
        }
        arrCndCrtn.setTxtCndVal(StringUtils.isEmpty(in.getRpymntWayCd()) ? txCndVal: in.getRpymntWayCd());
        arrCndCrtnList.add(arrCndCrtn);

        arrCndCrtn = new ArrCndCrtn();
        arrCndCrtn.setCndCd(PdCndEnum.REPAYMENT_TYPE_AFTER_PARTIAL_REPAYMENT.getValue());
        cndVal = pd.getCnd(PdCndEnum.REPAYMENT_TYPE_AFTER_PARTIAL_REPAYMENT.getValue()).getCndVal();
        if(cndVal == null) {
            // Condition cannot be found. Please check input value.
            throw new BizApplicationException("AAPPDE0005", null);
        }
        txCndVal = ((SmplListCndVal) pd.getCnd(PdCndEnum.REPAYMENT_TYPE_AFTER_PARTIAL_REPAYMENT.getValue()).getCndVal()).getBsicVal();
        if(StringUtils.isEmpty(txCndVal)) {
            // Condition cannot be found. Please check input value.
            throw new BizApplicationException("AAPPDE0005", null);
        }
        arrCndCrtn.setTxtCndVal(txCndVal);
        arrCndCrtnList.add(arrCndCrtn);

        arrCrtnIn.setArrBsicCrtn(arrBsicCrtn);
        arrCrtnIn.setArrCndList(arrCndCrtnList);

        return arrCrtnIn;
    }

    private CshflwSmltnSvcGetCshflwSmltnOut _assembleOutput(List<ArrCashFlowIO> arrCashFlowList) {

        CshflwSmltnSvcGetCshflwSmltnOut out = new CshflwSmltnSvcGetCshflwSmltnOut();
        Map<String, CshflwSmltnSvcRevenueOut> map = new HashMap<String, CshflwSmltnSvcRevenueOut>();

        for(ArrCashFlowIO cashFlowItm : arrCashFlowList) {
            CshflwSmltnSvcRevenueOut cashFlow = new CshflwSmltnSvcRevenueOut();

            cashFlow.setSeqNbr(cashFlowItm.getSeqNbr()); // Sequence
            cashFlow.setRpymntCyclNbr(cashFlowItm.getRpymntCyclNbr());
            cashFlow.setRpymntSchdldDt(cashFlowItm.getRpymntSchdldDt()); // Repayment scheduled date
            cashFlow.setRpymntSchdldAmt(cashFlowItm.getRpymntSchdldAmt()); // Repayment scheduled amount
            cashFlow.setAmtTpCd(cashFlowItm.getAmtTpCd());
            CshflwSmltnSvcRevenueOut tmpCashFlow = map.get(cashFlowItm.getRpymntSchdldDt());

            if(tmpCashFlow == null) {
                if (AmtTpEnum.PRNCPL.getValue().equals(cashFlowItm.getAmtTpCd())) {
                    cashFlow.setCalcnBaseAmt(cashFlowItm.getCalcnBaseAmt().subtract(cashFlowItm.getRpymntSchdldAmt()));
                    cashFlow.setPrncpl(cashFlowItm.getRpymntSchdldAmt()); // Principal amount
                } else {
                    cashFlow.setIntAmt(cashFlowItm.getRpymntSchdldAmt()); // Interest amount
                }

                map.put(cashFlowItm.getRpymntSchdldDt(), cashFlow);
            } else {
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
                map.put(cashFlowItm.getRpymntSchdldDt(), tmpCashFlow);
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

        out.setCshflwList(cshflwSmltnSvcRevenueOuts);

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
     * @return the arrMngr
     */
    private ArrMngr _getArrMngr() {
        if (arrMngr == null) {
            arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
        }
        return arrMngr;
    }

    /**
     * @return the pdMngr
     */
    private PdMngr _getPdMngr() {
        if (pdMngr == null) {
            pdMngr = (PdMngr) CbbApplicationContext.getBean(PdMngr.class, pdMngr);
        }
        return pdMngr;
    }
}
