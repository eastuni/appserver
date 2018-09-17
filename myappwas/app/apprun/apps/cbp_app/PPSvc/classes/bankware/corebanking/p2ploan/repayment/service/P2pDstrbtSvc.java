package bankware.corebanking.p2ploan.repayment.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.enums.ArrStsChngRsnEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrStsChngIn;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.ArrTxStdFrmtIn;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.EntryDtlIO;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.EntryIn;
import bankware.corebanking.core.settlement.enums.CashTrnsfrEnum;
import bankware.corebanking.core.settlement.enums.DpstWhdrwlEnum;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.deposit.enums.CustTxDscdDpstEnum;
import bankware.corebanking.deposit.financialtransaction.service.dto.DpstDpstSvcIn;
import bankware.corebanking.deposit.financialtransaction.service.dto.DpstWhdrwlSvcIn;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.loan.enums.LnRepaymentTypeEnum;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pDstrbtSvcDstrbtInfoIn;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pDstrbtSvcDstrbtRsltOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.amountcalculator.interfaces.P2PDvdndCalculator;
import bankware.corebanking.settlement.amountcalculator.interfaces.dto.DvdndHstOut;
import bankware.corebanking.settlement.amountcalculator.interfaces.dto.InqryDvdndHstIn;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTxMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 클래스는 배분 서비스를 제공합니다.
 * This class provides for distributing service.
 *
 * Author	Kisu Kim
 * History
 *  2016.03.09	initial version for 3.0
 */
@BxmService("P2pDstrbtSvc")
@BxmCategory(logicalName = "P2P Distribute Service")
@CbbClassInfo(classType={"SERVICE"})
public class P2pDstrbtSvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ArrMngr				arrMngr;				// Arrangement manager
    private ArrBalMngr			arrBalMngr;				// Arrangement balance manager
    private ArrTxMngr			arrTxMngr;				// Arrangement transaction manager
    private Cd					cd;						// Code
    private CmnContext			cmnContext;				// Common context
    private CustInfoInqryBizProc	custInfoInqryBizProc;	// Customer information inquiry bizproc
    private P2PDvdndCalculator	p2PDvdndCalculator;		// Dividend Calculator P2P Interface
    //private FeeCalculator		feeCalculator;			// Fee calculator

    /**
     * P2P 배분을 실행합니다.
     * Execute the P2P distribute.
     * <pre>
     * 1. 투자 수익 수수료를 계산합니다.
     *
     * 1. Calculate the investment profit fee.
     *
     * 2. 배당금을 계산합니다.
     *
     * 2. Calculate the dividends.
     *
     * 3. 투자 수익 수수료와 배당금을 사용하여 거래내역을 생성합니다.
     *
     * 3. Create the arrangement transaction using investment profit fee and dividends.
     *
     * 4. 상환된 원금과 배당금을 투자자의 계좌로 입금합니다.
     *
     * 4. The principal and the dividends deposit to investor's account.
     *
     * 5. 회수 원금이 0이라면 계약을 종료시킵니다.
     *
     * 5. Change the arrangement status if last balance is zero.
     * </pre>
     *
     * @param in (required) P2pDstrbtSvcDstrbtInfoIn: Arrangement identification, Repayment type distinction code, Total repayment principal, Normal interest, Overdue interest, Early termination fee, Last yes or no
     * @return P2pDstrbtSvcDstrbtRsltOut Distribution result
     * @throws BizApplicationException
     */
    @CbbSrvcInfo(srvcCd="SPP1091303", srvcNm="P2P Distribute Execution")
    @BxmCategory(logicalName = "P2P Distribute Execution")
    @BxmServiceOperation("executeP2pDistribute")
    @TransactionalOperation
    public P2pDstrbtSvcDstrbtRsltOut executeP2pDistribute(P2pDstrbtSvcDstrbtInfoIn in) throws BizApplicationException{

        /**
         * Get the arrangement
         */
        Arr arr = _getArrMngr().getArr(in.getArrId());

        /**
         * Get the customer's deposit account
         */
        String custDpstAcctNbr = _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr);

        /**
         * Get the currency code
         */
        String crncyCd = ((ArrCndLst) arr.getMthrArr().getArrCnd(PdCndEnum.CURRENCY.getValue())).getListCd();

        /**
         *  Numbering the transaction sequence number
         */
        int txSeqNbr = _getArrTxMngr().getTxSeqNbr(in.getArrId());

        /**
         * Calculate the fee
         */
        //FeeCalculatorOut feeCalculatorOut = _calculateInvestmentProfitFee(arr);

        /**
         * Calculate the dividend amount
         */
        DvdndHstOut dvdndHstOut = _calculateDividendAmount(arr, txSeqNbr, in);

        if( logger.isDebugEnabled() ) {

        	logger.debug("#@# =========================================== ");
        	logger.debug("#@# dvdndHstOut {}", dvdndHstOut.getPrncpl());
        	logger.debug("#@# dvdndHstOut {}", dvdndHstOut.getTotDvdndAmt());
        }

        /**
         * Make the arrangement transaction
         */
        //ArrTx arrTx = _createArrangementTransaction(arr, feeCalculatorOut, dvdndHstOut, crncyCd, custDpstAcctNbr, txSeqNbr, in);
        ArrTx arrTx = _createArrangementTransaction(arr, dvdndHstOut, crncyCd, custDpstAcctNbr, txSeqNbr, in);

        /**
         * Call the deposit service for deposit
         */
        _linkDepositDepositService(arr, arrTx, dvdndHstOut, crncyCd, custDpstAcctNbr);

        /**
         * Change the arrangement status if last balance is zero
         */
        _checkInvestmentPrincipalBanlance(arr, arrTx, crncyCd, txSeqNbr, in);

        return new P2pDstrbtSvcDstrbtRsltOut();
    }

//    private FeeCalculatorOut _calculateInvestmentProfitFee(Arr arr) throws BizApplicationException {
//
//        ArrCndActionRequiredValue arrCndActionRequiredValue = new ArrCndActionRequiredValue();
//
//        FeeCalculatorOut feeCalculatorOut = _getFeeCalculator().calculateFee(ArrSrvcEnum.DISTRIBUTE_P2P_INVESTMENT_PROFIT.getValue(), arr, arrCndActionRequiredValue, false);
//
//        return feeCalculatorOut;
//    }

    private DvdndHstOut _calculateDividendAmount(Arr arr, int txSeqNbr, P2pDstrbtSvcDstrbtInfoIn in) throws BizApplicationException {

        InqryDvdndHstIn inqryDvdndHstIn = new InqryDvdndHstIn();


        inqryDvdndHstIn.setPrncpl(in.getTotRpymntPrncpl());
        inqryDvdndHstIn.setNrmlIntAmt(in.getNrmlIntAmt());
        inqryDvdndHstIn.setIntOvrduIntAmt(in.getOvrduIntAmt());
        inqryDvdndHstIn.setFeeAmt(in.getErlyTrmntnFeeAmt());
        inqryDvdndHstIn.setTxSeqNbr(txSeqNbr);
        inqryDvdndHstIn.setLastNthYn(CCM01.YES.equals(in.getIsLast()) ? true: false);
        inqryDvdndHstIn.setErlyRpymntYn("02".equals(in.getRpymntTpDscd()) ? true: false);	// FIXME, Is early re-payment

        if( logger.isDebugEnabled() ) {

        	logger.debug("#@# =========================================== ");
        	logger.debug("#@# in.getTotRpymntPrncpl(): {} ", in.getTotRpymntPrncpl());
        	logger.debug("#@# in.getNrmlIntAmt(): {} ", in.getNrmlIntAmt());
        	logger.debug("#@# in.getOvrduIntAmt(): {} ", in.getOvrduIntAmt());
        	logger.debug("#@# in.getErlyTrmntnFeeAmt(): {} ", in.getErlyTrmntnFeeAmt());
        	logger.debug("#@# in.setTxSeqNbr(): {} ", txSeqNbr);
        	logger.debug("#@# in.getIsLast(): {} ", in.getIsLast());
        	logger.debug("#@# =========================================== ");
//        	logger.debug("#@# inqryDvdndHstIn.isIsLast(): {}", inqryDvdndHstIn.isIsLast());
//        	logger.debug("#@# inqryDvdndHstIn.isIsErlyRpymnt(): {}", inqryDvdndHstIn.isIsErlyRpymnt());
        }

        DvdndHstOut dvdndHstOut = _getP2PDvdndCalculator().calculateInvestmentArrDividend(arr, inqryDvdndHstIn);

        return dvdndHstOut;
    }

    //private ArrTx _createArrangementTransaction(Arr arr, FeeCalculatorOut feeCalculatorOut, DvdndHstOut dvdndHstOut, String crncyCd, String custDpstAcctNbr, int txSeqNbr, P2pDstrbtSvcDstrbtInfoIn in) throws BizApplicationException {\
    private ArrTx _createArrangementTransaction(Arr arr, DvdndHstOut dvdndHstOut, String crncyCd, String custDpstAcctNbr, int txSeqNbr, P2pDstrbtSvcDstrbtInfoIn in) throws BizApplicationException {

        ArrTx arrTx = null;
        List<EntryIn> entryIns = new ArrayList<EntryIn>();
        ArrTxStdFrmtIn arrTxStdFrmtIn = new ArrTxStdFrmtIn();
        arrTxStdFrmtIn.setTxCustId(arr.getMainCust().getCustId());
        arrTxStdFrmtIn.setCrncyCd(crncyCd);
        arrTxStdFrmtIn.setTxSeqNbr(txSeqNbr);

//        if(BigDecimal.ZERO.compareTo(feeCalculatorOut.getFeeDcsnAmt()) != 0) {
//            EntryIn entryIn = new EntryIn();
//
//            entryIn.setAmtTpCd(AmtTpEnum.INVSTMNT_RPYMNT_FEE.getValue());
//            entryIn.setCrncyCd(crncyCd);
//            entryIn.setDpstWhdrwlDscd(DpstWhdrwlEnum.DPST.getValue());
//            entryIn.setCashTrnsfrDscd(CashTrnsfrEnum.TRNSFR.getValue());
//            entryIn.setTxAmt(feeCalculatorOut.getFeeDcsnAmt());
//
//            entryIns.add(entryIn);
//        }

        if(BigDecimal.ZERO.compareTo(dvdndHstOut.getTotDvdndAmt()) != 0) {
            EntryIn entryIn = new EntryIn();

            entryIn.setAmtTpCd(AmtTpEnum.DVDND_INCOME.getValue());
            entryIn.setCrncyCd(crncyCd);
            entryIn.setDpstWhdrwlDscd(DpstWhdrwlEnum.WHDRWL.getValue());
            entryIn.setCashTrnsfrDscd(CashTrnsfrEnum.TRNSFR.getValue());
            entryIn.setTxAmt(dvdndHstOut.getTotDvdndAmt());

            entryIns.add(entryIn);
        }

        if(BigDecimal.ZERO.compareTo(dvdndHstOut.getPrncpl()) != 0) {
            EntryIn entryIn = new EntryIn();

            entryIn.setAmtTpCd(AmtTpEnum.PRNCPL.getValue());
            entryIn.setCrncyCd(crncyCd);
            entryIn.setDpstWhdrwlDscd(DpstWhdrwlEnum.WHDRWL.getValue());
            entryIn.setCashTrnsfrDscd(CashTrnsfrEnum.TRNSFR.getValue());
            entryIn.setTxAmt(dvdndHstOut.getPrncpl());

            entryIns.add(entryIn);
        }

        if(entryIns.size() != 0) {
            arrTxStdFrmtIn.setTxEntry(entryIns);
        }

        arrTx = _getArrTxMngr().createArrTx(arrTxStdFrmtIn, arr);

//        if(BigDecimal.ZERO.compareTo(feeCalculatorOut.getFeeDcsnAmt()) != 0) {
//            _linkDepositDrawingService(custDpstAcctNbr, crncyCd, feeCalculatorOut.getFeeDcsnAmt(), _createRemark(arr, entryIns));
//        }

        return arrTx;
    }

    private void _linkDepositDrawingService(String whdrwlAcctNbr, String crncyCd, BigDecimal totWithrawAmt, String rmk) throws BizApplicationException {

        DpstWhdrwlSvcIn dpstWhdrwlIn = new DpstWhdrwlSvcIn();

        dpstWhdrwlIn.setAcctNbr(whdrwlAcctNbr);
        dpstWhdrwlIn.setCrncyCd(crncyCd);
        dpstWhdrwlIn.setTxAmt(totWithrawAmt);
        dpstWhdrwlIn.setTrnsfrAmt(totWithrawAmt);
        dpstWhdrwlIn.setTxRmkCntnt(rmk);
        dpstWhdrwlIn.setCustTxDscd(CustTxDscdDpstEnum.WITHDRAWAL_FEE.getValue());

        CbbInternalServiceExecutor.execute("SDP0120200", dpstWhdrwlIn);
    }

    private String _createRemark(Arr arr, List<EntryIn> entryIns) throws BizApplicationException {

        // FIXME, Hard coding
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append(arr.getAplctnNbr()+" ( ");

        for(int i = 0; i < entryIns.size(); i++) {
            EntryIn entryIn = entryIns.get(i);

            if(!stringBuilder.toString().equals(arr.getAplctnNbr()+" ( ")){
                stringBuilder.append(", ");
                stringBuilder.append(_getCd().getCode("50026", entryIn.getAmtTpCd()));
                stringBuilder.append(" : ");
                stringBuilder.append(entryIn.getTxAmt());
            }
        }

        stringBuilder.append(" ) ");

        return stringBuilder.toString();
    }

    private void _linkDepositDepositService(Arr arr, ArrTx arrTx, DvdndHstOut dvdndHstOut, String crncyCd, String custDpstAcctNbr) throws BizApplicationException {

        String wkRmk = "";
        DpstDpstSvcIn dpstDpstSvcIn = new DpstDpstSvcIn();

        // Generate a deposit remark
        // 2016.01.04 입출금 내역의 상세를 remarks 표시한다.(확인 : 이기정, 박희정, 김성범, 이호근)
        for(EntryDtlIO entryDtl : arrTx.getListEntry()) {
            if(entryDtl.getAmtTpCd().equals(AmtTpEnum.PRNCPL.getValue())) {
                wkRmk = wkRmk + "Investement Principal : " + entryDtl.getTxAmt();
            }
            if(entryDtl.getAmtTpCd().equals(AmtTpEnum.DVDND_INCOME.getValue())) {
                wkRmk = wkRmk + " Investement Earning : " + entryDtl.getTxAmt();
            }
            if(entryDtl.getAmtTpCd().equals(AmtTpEnum.INVSTMNT_RPYMNT_FEE.getValue())) {
                wkRmk = wkRmk + " Investement Repayment Fee : " + entryDtl.getTxAmt();
            }
            if(entryDtl.getAmtTpCd().equals(AmtTpEnum.INT_TAX.getValue())) {
                wkRmk = wkRmk + " Income Tax and Residence Tax : " + entryDtl.getTxAmt();
            }
        }

        dpstDpstSvcIn.setAcctNbr(custDpstAcctNbr);
        dpstDpstSvcIn.setCrncyCd(crncyCd);
        dpstDpstSvcIn.setTxRmkCntnt(wkRmk);
        dpstDpstSvcIn.setMnyRcvdAmtKndDscd1(CashTrnsfrEnum.TRNSFR.getValue());
        dpstDpstSvcIn.setRcptAmt1(dvdndHstOut.getPrncpl().add(dvdndHstOut.getTotDvdndAmt()));
        dpstDpstSvcIn.setTxAmt(dvdndHstOut.getPrncpl().add(dvdndHstOut.getTotDvdndAmt()));
        dpstDpstSvcIn.setCustTxDscd(CustTxDscdDpstEnum.DEPOSIT_TRANSFER.getValue());

        CbbInternalServiceExecutor.execute("SDP0110100", dpstDpstSvcIn);
    }

    private void _checkInvestmentPrincipalBanlance(Arr arr, ArrTx arrTx, String crncyCd, int txSeqNbr, P2pDstrbtSvcDstrbtInfoIn in) throws BizApplicationException {

        if(_getArrBalMngr().getArrPrincipalBal(arr, crncyCd).getLastBal().compareTo(BigDecimal.ZERO) == 0) {
            // Contract Closed
            ArrStsChngIn arrStsChngIn = new ArrStsChngIn();

            arrStsChngIn.setArrStsChngDt(_getCmnContext().getTxDate());
            arrStsChngIn.setTxDt(_getCmnContext().getTxDate());
            arrStsChngIn.setTxSeqNbr(txSeqNbr);
            if(LnRepaymentTypeEnum.REGULAR_REPAYMENT.getValue().equals(in.getRpymntTpDscd())) {
                arrStsChngIn.setArrStsChngRsnCd(ArrStsChngRsnEnum.TERMINATED_NORMAL.getValue());
            } else if(LnRepaymentTypeEnum.EARLY_REPAYMENT.getValue().equals(in.getRpymntTpDscd())) {
                arrStsChngIn.setArrStsChngRsnCd(ArrStsChngRsnEnum.TERMINATED_EARLY.getValue());
            }

            arr.terminate(arrStsChngIn);
        }
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
     * @return the arrBalMngr
     */
    private ArrBalMngr _getArrBalMngr() {
        if (arrBalMngr == null) {
            arrBalMngr = (ArrBalMngr) CbbApplicationContext.getBean(ArrBalMngr.class, arrBalMngr);
        }
        return arrBalMngr;
    }

    /**
     * @return the arrTxMngr
     */
    private ArrTxMngr _getArrTxMngr() {
        if (arrTxMngr == null) {
            arrTxMngr = (ArrTxMngr) CbbApplicationContext.getBean(ArrTxMngr.class, arrTxMngr);
        }
        return arrTxMngr;
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

//    /**
//     * @return the feeCalculator
//     */
//    private FeeCalculator _getFeeCalculator() {
//        if (feeCalculator == null) {
//            feeCalculator = (FeeCalculator) CbbApplicationContext.getBean(
//                    FeeCalculator.class, feeCalculator);
//        }
//        return feeCalculator;
//    }
}
