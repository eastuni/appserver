package bankware.corebanking.p2plending.listreport.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrP2pMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.ArrTxInqryDtIn;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.listreport.service.dto.LendingListInqrySvcLendingListIn;
import bankware.corebanking.p2plending.listreport.service.dto.LendingListInqrySvcLendingListOutIncludeSmryInfoOut;
import bankware.corebanking.p2ploan.bizproc.LnBizProc;
import bankware.corebanking.p2ploan.information.service.dto.LnListOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.amountcalculator.interfaces.P2PDvdndCalculator;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTxMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bankware.corebanking.settlement.enums.RpymntStatusEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 P2P투자목록을 조회한다.
 * This service allows to inquire P2P lending list
 *
 * Author	Sungbum Kim
 * History
 *  2015.12.21	initial version for 2.3
 */
@BxmCategory(logicalName ="P2P Lending List Inquiry Service")
@CbbClassInfo(classType={"SERVICE"})
@BxmService("LendingListInqrySvc")
public class LendingListInqrySvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ArrP2pMngr           arrP2pMngr;        	// Arrangement P2P manager
    private ArrBalMngr			arrBalMngr;			// Arrangement balance manager
    private Cd					cd;					// Code
    private ArrTxMngr			arrTxMngr;			// Arrangement transaction manager
    private LnBizProc    		lnBizProc; 			// Loan bizproc
    private P2PDvdndCalculator  	p2PDvdndCalculator; // Cash flow manager
    private ArrCndInqryBizProc	arrCndInqryBizProc; // Arrangement condition inquiry bizproc
    private CmnContext 			cmnContext;			// Common System Header Utility

    /**
     * Search P2P lending List and Summary Information by Customer Id and parent Arrangement status
     * 고객 식별자와 부모 계약 상태를 이용하여 투자계약 목록과 요약정보를 조회한다.
     *
     * <pre>
     * flow description
     *
     * 1. Set default value
     *    1.1 Set Customer Identification when it is null
     *    1.2 Set Department Code when it is null
     *    1.3 Set Start date when it is null
     *    1.4 Set End date when it is null
     *
     * 2. search lending list By Customer Identification and parent Arrangement status
     *
     * 3. Build Output data
     *    3.1 Assemble Summary Information
     *    3.2 Assemble lending list of specific arrangement status
     *
     * </pre>
     * @param in (required) LendingListInqrySvcLendingListIn : Customer identification
     * @return LendingListInqrySvcLendingListOut Lending list & Summary information of specific arrangement status
     * @throws BizApplicationException
     */
    @BxmServiceOperation("getLendingInfos")
    @TransactionalOperation
    @CbbSrvcInfo(srvcCd="SPP3030400", srvcNm="Get Lending List")
    @BxmCategory(logicalName = "Get Lending Informations")
    public LendingListInqrySvcLendingListOutIncludeSmryInfoOut getLendingInfos(LendingListInqrySvcLendingListIn in)  throws BizApplicationException{

        /**
         * Set default value
         */
        _setDefaultValue(in);

        /**
         * Get P2P Loan With Lending Arrangement List By Customer Identification
         */
        List<ArrReal> arrRealList = _getLendingListByCustomerArrangementStatus(in);

        /**
         * Build & Return Input Value
         */
        return _buildOutputIncludeSummray(arrRealList, in);
    }

    private void _setDefaultValue(LendingListInqrySvcLendingListIn in) throws BizApplicationException {

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

    /**
     * Get P2P Lending List By CustID & Arrangement Status
     * @param in (required) LendingListInqrySvcLendingListIn
     * @return  List<P2p>
     * @throws BizApplicationException
     */
    private List<ArrReal> _getLendingListByCustomerArrangementStatus(LendingListInqrySvcLendingListIn in) throws BizApplicationException {

        /**
         * Get P2P Lending Arrangement List By Customer Identification
         */
        List<ArrReal> arrRealList = null;
        if(ArrStsEnum.START_BID.getValue().equals(in.getArrStsCd())){
            arrRealList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), ArrStsEnum.START_BID, in.getInqryStartDt(), in.getInqryEndDt());
        } else
        if(ArrStsEnum.ACTIVE.getValue().equals(in.getArrStsCd())){
            arrRealList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), ArrStsEnum.ACTIVE, in.getInqryStartDt(), in.getInqryEndDt());
        } else
        if(ArrStsEnum.TERMINATED.getValue().equals(in.getArrStsCd())){
            arrRealList = _getArrP2pMngr().getListCustOwnArrRealByBidCust(in.getCustId(), ArrStsEnum.TERMINATED, in.getInqryStartDt(), in.getInqryEndDt());
        }

        return arrRealList;
    }

    /**
     * Build & Return Input Value
     * @param in (required) List<ArrReal>
     * @param in (required) String
     * @return LendingListInqrySvcLendingListOutIncludeSmryInfoOut
     * @throws BizApplicationException
     */
    private LendingListInqrySvcLendingListOutIncludeSmryInfoOut _buildOutputIncludeSummray(List<ArrReal> arrRealList, LendingListInqrySvcLendingListIn in) throws BizApplicationException {

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut out = new LendingListInqrySvcLendingListOutIncludeSmryInfoOut();

        if(ArrStsEnum.START_BID.getValue().equals(in.getArrStsCd())){
            out = _filterStartBidList(arrRealList, in);
        } else
        if(ArrStsEnum.ACTIVE.getValue().equals(in.getArrStsCd())) {
            out = _filterActiveList(arrRealList, in);
        } else
        if(ArrStsEnum.TERMINATED.getValue().equals(in.getArrStsCd())) {
            out = _filterTerminatedList(arrRealList, in);
        }

        return out;
    }

    /**
     * Build Output
     * @param p2pLoanList (required) List<ArrReal>
     * @return  LendingListInqryMgmtSvcLnListOut
     * @throws BizApplicationException
     */
    private LendingListInqrySvcLendingListOutIncludeSmryInfoOut _filterStartBidList(List<ArrReal> p2pLendingList, LendingListInqrySvcLendingListIn in) throws BizApplicationException {

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut LendingListInqrySvcLendingListOutIncludeSmryInfoOut = new LendingListInqrySvcLendingListOutIncludeSmryInfoOut();
        List<LnListOut> lnListOutList = new ArrayList<LnListOut>();
        LnListOut lnListOut = null;
        BigDecimal invstmntBiddingCnt = BigDecimal.ZERO;
        BigDecimal invstmntBiddingSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdProfitSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;
        BigDecimal totInvstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;
        BigDecimal averageInvstmntBiddingAmt = BigDecimal.ZERO;

        for( ArrReal arrReal : p2pLendingList){
            lnListOut = new LnListOut();

            Arr mthArr = (Arr)arrReal.getMthrArr();

            if(ArrStsEnum.APPLIED.getValue().equals(arrReal.getArrSts().getValue())) {
                String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
                BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);

                lnListOut.setAplctnDt(mthArr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
                lnListOut.setAplctnNbr(mthArr.getAplctnNbr());
                lnListOut.setPdCd(mthArr.getPdCd());
                lnListOut.setPdNm(mthArr.getPd().getPdNm());
                lnListOut.setLoinIdNbr(mthArr.getMainCust().getLoginIdNbr());
                lnListOut.setCustId(mthArr.getMainCust().getCustId());
                lnListOut.setCustNm(mthArr.getMainCust().getName());

                lnListOut.setAprvlAplctnIntRt(((ArrCndInt) mthArr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());
                lnListOut.setAplctnAmt(cntrtAmtStr);
                String lnAprvlTrmStr = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue()));
                lnListOut.setLonAprvlTrmCnt(lnAprvlTrmStr);	 // Loan Term

                lnListOut.setArrStsCd(arrReal.getArrSts().getValue());
                lnListOut.setPrgrsStsCd(_getCd().getCode("50000", arrReal.getArrSts().getValue()));
                lnListOut.setArrId(mthArr.getArrId()); // Arrangement Id

                String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CURRENCY.getValue()));

                ArrBal residualAmtBal = _getArrBalMngr().getArrBal(mthArr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd==null?"CNY":crncyCd);
                ArrBal biddingCntBal = _getArrBalMngr().getArrBal(mthArr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT_CNT.getValue(), crncyCd==null?"CNY":crncyCd);
                //입찰진척률
                lnListOut.setBiddingPrgrsRt(_getLnBizProc().getPercentage(cntrtAmt, residualAmtBal.getLastBal()));
                //입찰누적건수
                lnListOut.setBiddingCnt(biddingCntBal.getLastBal());

                lnListOut.setLnRsnCntnt(mthArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_REASON_CONTENT));

                String lnPurposeCd = mthArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
                String p2pInvstmntRatingCd = mthArr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
                String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
                String bidWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue()));

                if(lnPurposeCd != null && !lnPurposeCd.isEmpty()) {
                    lnListOut.setLnPurposeCd(lnPurposeCd);
                    lnListOut.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
                }

                if(p2pInvstmntRatingCd != null && !p2pInvstmntRatingCd.isEmpty()) {
                    lnListOut.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
                    lnListOut.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
                }
                lnListOut.setExctnDt(mthArr.getArrOpnDt());
                lnListOut.setArrMtrtyDt(mthArr.getArrMtrtyDt());
                if(rpymntWayCd != null && !rpymntWayCd.isEmpty()) {
                    lnListOut.setRpymntWayCd(rpymntWayCd);
                    lnListOut.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
                }
                if(bidWayCd != null && !bidWayCd.isEmpty()) {
                    lnListOut.setBiddingMthdCdVal(_getCd().getCode("A0432", bidWayCd));
                    lnListOut.setBiddingMthdCd(bidWayCd);
                }

                lnListOut.setBiddingClsgTmstmp(mthArr.getExtendAttribute(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP));
                lnListOut.setDesiredAmtExcsBidAcceptYn(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN)));
                lnListOut.setDesiredAmtExcsPrmsnMaxAmt(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_LOAN_DESIRED_MAXIMUM_AMOUNT)));

                ArrTxInqryDtIn arrTxInqryDtIn = new ArrTxInqryDtIn();
                arrTxInqryDtIn.setInqryStartDt(CCM01.MIN_DATE);
                arrTxInqryDtIn.setInqryEndDt(CCM01.MAX_DATE);
                List<String> amtTpList = new ArrayList<String>();
                amtTpList.add(AmtTpEnum.LN_APLCTN_FEE.getValue());
                arrTxInqryDtIn.setAmtTpCdList(amtTpList);

                List<ArrTx> arrTxList = _getArrTxMngr().getListArrTxWithAmtTp(arrTxInqryDtIn, (ArrReal) mthArr);
                if(arrTxList != null && arrTxList.size() > 0) {
                    lnListOut.setLnAplctnFeeAmt(arrTxList.get(0).getTxAmt());
                }
                ArrBal arrBal = _getArrBalMngr().getArrBal(arrReal, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
                BigDecimal arrBalAmt = arrBal.getLastBal();
                lnListOut.setArrBal(arrBalAmt);

                //investment product code
                lnListOut.setChildPdCd(_getLnBizProc().getChildArrPdCd(mthArr));

                //investment Item Build
                String invstmntCntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arrReal.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
                BigDecimal invstmntCntrtAmt = new BigDecimal(invstmntCntrtAmtStr);

                // Investment Information
                lnListOut.setSubArrId(arrReal.getArrId());
                lnListOut.setInvstmntAmt(invstmntCntrtAmt);
                BigDecimal invstmntRt = ((ArrCndInt) arrReal.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt();
                lnListOut.setInvstmntRt(invstmntRt);
                lnListOut.setInvstmntDt(arrReal.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());

                if(invstmntCntrtAmt.compareTo(BigDecimal.ZERO) > 0 && (invstmntRt != null && invstmntRt.compareTo(BigDecimal.ZERO) > 0)) {
                    invstmntExpctdRtrnOnInvstmnt = invstmntExpctdRtrnOnInvstmnt.add(invstmntCntrtAmt.multiply(invstmntRt));
                }

                lnListOut.setExctnDt(mthArr.getArrOpnDt());
                lnListOut.setArrMtrtyDt(mthArr.getArrMtrtyDt());

                invstmntBiddingCnt = invstmntBiddingCnt.add(BigDecimal.ONE);
                invstmntBiddingSumAmt = invstmntBiddingSumAmt.add(invstmntCntrtAmt);
                BigDecimal tempAmt = BigDecimal.ZERO;
                BigDecimal lnAprvlTrm = new BigDecimal(lnAprvlTrmStr);
                // 기대수익
                if (invstmntRt !=null && invstmntRt.compareTo(BigDecimal.ZERO) > 0){
                    tempAmt = invstmntCntrtAmt.multiply(invstmntRt.divide(BigDecimal.valueOf(100)));
                    tempAmt = tempAmt.multiply(lnAprvlTrm.divide(BigDecimal.valueOf(12)));
                    invstmntExpctdProfitSumAmt = invstmntExpctdProfitSumAmt.add(tempAmt);
                }

                lnListOutList.add(lnListOut);
            }
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setLendingList(lnListOutList);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntBiddingCnt(invstmntBiddingCnt);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntBiddingSumAmt(invstmntBiddingSumAmt);

        if(invstmntBiddingCnt.compareTo(BigDecimal.ZERO) > 0) {
            averageInvstmntBiddingAmt = invstmntBiddingSumAmt.divide(invstmntBiddingCnt, 2, BigDecimal.ROUND_HALF_UP);
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setAvgInvstmntAmt(averageInvstmntBiddingAmt);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntExpctdProfitRmndAmt(invstmntExpctdProfitSumAmt);

        if(invstmntBiddingSumAmt.compareTo(BigDecimal.ZERO) > 0 && invstmntExpctdRtrnOnInvstmnt.compareTo(BigDecimal.ZERO) > 0) {
            totInvstmntExpctdRtrnOnInvstmnt = invstmntExpctdRtrnOnInvstmnt.divide(invstmntBiddingSumAmt, 2, BigDecimal.ROUND_HALF_UP);
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntExpctdRtrnOnInvstmntRt(totInvstmntExpctdRtrnOnInvstmnt);

        return LendingListInqrySvcLendingListOutIncludeSmryInfoOut;
    }

    /**
     * Build Output
     * @paramp2pLoanList (required) List<ArrReal>
     * @return LendingListInqryMgmtSvcLnListOut
     * @throws BizApplicationException
     */
    private LendingListInqrySvcLendingListOutIncludeSmryInfoOut _filterActiveList(List<ArrReal> p2pLendingList, LendingListInqrySvcLendingListIn in) throws BizApplicationException {

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut LendingListInqrySvcLendingListOutIncludeSmryInfoOut = new LendingListInqrySvcLendingListOutIncludeSmryInfoOut();
        List<LnListOut> lnListOutList = new ArrayList<LnListOut>();
        LnListOut lnListOut = null;

        BigDecimal invstmntCollectionCnt = BigDecimal.ZERO;
        BigDecimal invstmntCollectionSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntBalAmtSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntProfitSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdProfitRmngSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntPaybackOfPrncplSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;
        BigDecimal totInvstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;

        for( ArrReal arrReal : p2pLendingList){
            lnListOut = new LnListOut();

            Arr mthArr = (Arr)arrReal.getMthrArr();

            if(ArrStsEnum.ACTIVE.getValue().equals(arrReal.getArrSts().getValue())) {
                String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
                lnListOut.setAplctnDt(mthArr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
                lnListOut.setAplctnNbr(mthArr.getAplctnNbr());
                lnListOut.setPdCd(mthArr.getPdCd());
                lnListOut.setPdNm(mthArr.getPd().getPdNm());
                lnListOut.setLoinIdNbr(mthArr.getMainCust().getLoginIdNbr());
                lnListOut.setCustId(mthArr.getMainCust().getCustId());
                lnListOut.setCustNm(mthArr.getMainCust().getName());

                lnListOut.setAprvlAplctnIntRt(((ArrCndInt) mthArr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());
                lnListOut.setAplctnAmt(cntrtAmtStr);
                String lnAprvlTrmStr = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue()));
                lnListOut.setLonAprvlTrmCnt(lnAprvlTrmStr);	 // Loan Term

                lnListOut.setArrStsCd(arrReal.getArrSts().getValue());
                lnListOut.setPrgrsStsCd(_getCd().getCode("50000", arrReal.getArrSts().getValue()));
                lnListOut.setArrId(mthArr.getArrId());  // Arrangement Id

                String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CURRENCY.getValue()));

                String lnPurposeCd = mthArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
                String p2pInvstmntRatingCd = mthArr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
                String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
                String bidWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue()));

                if(lnPurposeCd != null && !lnPurposeCd.isEmpty()) {
                    lnListOut.setLnPurposeCd(lnPurposeCd);
                    lnListOut.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
                }

                if(p2pInvstmntRatingCd != null && !p2pInvstmntRatingCd.isEmpty()) {
                    lnListOut.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
                    lnListOut.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
                }
                lnListOut.setExctnDt(mthArr.getArrOpnDt());
                lnListOut.setArrMtrtyDt(mthArr.getArrMtrtyDt());
                if(rpymntWayCd != null && !rpymntWayCd.isEmpty()) {
                    lnListOut.setRpymntWayCd(rpymntWayCd);
                    lnListOut.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
                }
                if(bidWayCd != null && !bidWayCd.isEmpty()) {
                    lnListOut.setBiddingMthdCdVal(_getCd().getCode("A0432", bidWayCd));
                    lnListOut.setBiddingMthdCd(bidWayCd);
                }

                lnListOut.setDesiredAmtExcsBidAcceptYn(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN)));
                lnListOut.setDesiredAmtExcsPrmsnMaxAmt(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_LOAN_DESIRED_MAXIMUM_AMOUNT)));

                ArrTxInqryDtIn arrTxInqryDtIn = new ArrTxInqryDtIn();
                arrTxInqryDtIn.setInqryStartDt(CCM01.MIN_DATE);
                arrTxInqryDtIn.setInqryEndDt(CCM01.MAX_DATE);
                List<String> amtTpList = new ArrayList<String>();
                amtTpList.add(AmtTpEnum.LN_APLCTN_FEE.getValue());
                arrTxInqryDtIn.setAmtTpCdList(amtTpList);

                List<ArrTx> arrTxList = _getArrTxMngr().getListArrTxWithAmtTp(arrTxInqryDtIn, (ArrReal) mthArr);
                if(arrTxList != null && arrTxList.size() > 0) {
                    lnListOut.setLnAplctnFeeAmt(arrTxList.get(0).getTxAmt());
                }
                ArrBal arrBal = _getArrBalMngr().getArrBal(arrReal, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
                BigDecimal arrBalAmt = arrBal.getLastBal();
                lnListOut.setArrBal(arrBalAmt);

                //investment product code
                lnListOut.setChildPdCd(_getLnBizProc().getChildArrPdCd(mthArr));

                //investment Item Build
                String invstmntCntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arrReal.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
                BigDecimal invstmntCntrtAmt = new BigDecimal(invstmntCntrtAmtStr);

                // Investment Information
                lnListOut.setSubArrId(arrReal.getArrId());
                lnListOut.setInvstmntAmt(invstmntCntrtAmt);

                BigDecimal invstmntRt = ((ArrCndInt) arrReal.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt();
                lnListOut.setInvstmntRt(invstmntRt);
                lnListOut.setInvstmntDt(arrReal.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());

                lnListOut.setExctnDt(mthArr.getArrOpnDt());
                lnListOut.setArrMtrtyDt(mthArr.getArrMtrtyDt());

                ArrBal arrIntBal = _getArrBalMngr().getArrBal(arrReal, AmtTpEnum.DVDND_INCOME.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd);
                BigDecimal invstmntProfitAmt = BigDecimal.ZERO;
                BigDecimal rtrnOnInvstmnt = BigDecimal.ZERO;
                if(arrIntBal != null) {
                    invstmntProfitAmt = arrIntBal.getLastBal();
                    lnListOut.setInvstmntProfitAmt(invstmntProfitAmt);
                }
                invstmntProfitSumAmt = invstmntProfitSumAmt.add(invstmntProfitAmt);
                if(invstmntCntrtAmt.compareTo(BigDecimal.ZERO) > 0 && invstmntProfitAmt.compareTo(BigDecimal.ZERO) > 0) {
                    rtrnOnInvstmnt = invstmntProfitAmt.divide(invstmntCntrtAmt, 4, BigDecimal.ROUND_CEILING).multiply(BigDecimal.valueOf(100));
                    lnListOut.setRtrnOnInvstmntRt(rtrnOnInvstmnt);
                }

                // Get lending cash flow
                List<ArrCashFlowIO> cashFlowList =
                        _getP2PDvdndCalculator().getInvestmentCashFlowSchedule(arrReal);
                BigDecimal invstmntExpctdProfitRmngAmt = BigDecimal.ZERO;//투자예상수익잔존금액
                for(ArrCashFlowIO cashFlowIO : cashFlowList) {
                    if(cashFlowIO.getRpymntStsCd().equals(RpymntStatusEnum.RPYMNT_STS_CD_NNPM.getValue())) {
                        if(cashFlowIO.getAmtTpCd().equals(AmtTpEnum.LN_NORMAL_INT.getValue())) {
                            BigDecimal rpymntSchdldAmt = cashFlowIO.getRpymntSchdldAmt();
                            invstmntExpctdProfitRmngAmt = invstmntExpctdProfitRmngAmt.add(rpymntSchdldAmt);
                        }
                    }
                }

                lnListOut.setInvstmntExpctdProfitRmndAmt(invstmntExpctdProfitRmngAmt);

                invstmntCollectionCnt = invstmntCollectionCnt.add(BigDecimal.ONE);
                invstmntCollectionSumAmt = invstmntCollectionSumAmt.add(invstmntCntrtAmt);
                invstmntBalAmtSumAmt = invstmntBalAmtSumAmt.add(arrBalAmt);
                invstmntExpctdProfitRmngSumAmt = invstmntExpctdProfitRmngSumAmt.add(invstmntExpctdProfitRmngAmt);
                if(invstmntCntrtAmt.compareTo(BigDecimal.ZERO) > 0 && (invstmntRt != null && invstmntRt.compareTo(BigDecimal.ZERO) > 0)) {
                    invstmntExpctdRtrnOnInvstmnt = invstmntExpctdRtrnOnInvstmnt.add(invstmntCntrtAmt.multiply(invstmntRt));
                }

                // Total Repayments AmountPayBack(Principal 원금-Total Return Amount 총회수금액)
                BigDecimal invstmntPaybackOfPrncplAmt = _getArrBalMngr().getArrBal(arrReal, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd).getLastBal();
                invstmntPaybackOfPrncplSumAmt = invstmntPaybackOfPrncplSumAmt.add(invstmntPaybackOfPrncplAmt);

                lnListOutList.add(lnListOut);
            }
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setLendingList(lnListOutList);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntClctnCnt(invstmntCollectionCnt);//건수
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntClctnSumAmt(invstmntCollectionSumAmt);//합계
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntBalSumAmt(invstmntBalAmtSumAmt);//잔액합계

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntPaybackOfPrncplSumAmt(invstmntPaybackOfPrncplSumAmt);//투자회수합계
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntProfitSumAmt(invstmntProfitSumAmt);//투자수익합계
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntExpctdProfitRmndAmt(invstmntExpctdProfitRmngSumAmt);//투자예상수익잔존금액

        // 연간투자이율
        if(invstmntCollectionSumAmt.compareTo(BigDecimal.ZERO) > 0 && invstmntExpctdRtrnOnInvstmnt.compareTo(BigDecimal.ZERO) > 0) {
            totInvstmntExpctdRtrnOnInvstmnt = invstmntExpctdRtrnOnInvstmnt.divide(invstmntCollectionSumAmt, 2, BigDecimal.ROUND_CEILING);
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntExpctdRtrnOnInvstmntRt(totInvstmntExpctdRtrnOnInvstmnt);

        return LendingListInqrySvcLendingListOutIncludeSmryInfoOut;
    }

    /**
     * Build Output
     * @param p2pLoanList (required) List<ArrReal>
     * @return  LendingListInqryMgmtSvcLnListOut
     * @throws BizApplicationException
     */
    private LendingListInqrySvcLendingListOutIncludeSmryInfoOut _filterTerminatedList(List<ArrReal> p2pLendingList, LendingListInqrySvcLendingListIn in) throws BizApplicationException {

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut LendingListInqrySvcLendingListOutIncludeSmryInfoOut = new LendingListInqrySvcLendingListOutIncludeSmryInfoOut();
        List<LnListOut> lnListOutList = new ArrayList<LnListOut>();
        LnListOut lnListOut = null;

        BigDecimal invstmntTrmntCnt = BigDecimal.ZERO;
        BigDecimal invstmntTrmntSumAmt = BigDecimal.ZERO;
        BigDecimal invstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;
        BigDecimal totInvstmntExpctdRtrnOnInvstmnt = BigDecimal.ZERO;
        BigDecimal invstmntProfitSumAmt = BigDecimal.ZERO;

        for( ArrReal arrReal : p2pLendingList){
            lnListOut = new LnListOut();

            Arr mthArr = (Arr)arrReal.getMthrArr();

            if(ArrStsEnum.TERMINATED.getValue().equals(arrReal.getArrSts().getValue())) {
                String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
                BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);

                lnListOut.setAplctnDt(mthArr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
                lnListOut.setAplctnNbr(mthArr.getAplctnNbr());
                lnListOut.setPdCd(mthArr.getPdCd());
                lnListOut.setPdNm(mthArr.getPd().getPdNm());
                lnListOut.setLoinIdNbr(mthArr.getMainCust().getLoginIdNbr());
                lnListOut.setCustId(mthArr.getMainCust().getCustId());
                lnListOut.setCustNm(mthArr.getMainCust().getName());

                lnListOut.setAprvlAplctnIntRt(((ArrCndInt) mthArr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());
                lnListOut.setAplctnAmt(cntrtAmtStr);
                lnListOut.setLonAprvlTrmCnt(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue())));	 // Loan Term

                lnListOut.setArrStsCd(arrReal.getArrSts().getValue());
                lnListOut.setPrgrsStsCd(_getCd().getCode("50000", arrReal.getArrSts().getValue()));
                lnListOut.setArrId(mthArr.getArrId());  // Arrangement Id

                String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.CURRENCY.getValue()));

                ArrBal residualAmtBal = _getArrBalMngr().getArrBal(mthArr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd==null?"CNY":crncyCd);
                ArrBal biddingCntBal = _getArrBalMngr().getArrBal(mthArr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT_CNT.getValue(), crncyCd==null?"CNY":crncyCd);
                //입찰진척률
                lnListOut.setBiddingPrgrsRt(_getLnBizProc().getPercentage(cntrtAmt, residualAmtBal.getLastBal()));
                //입찰누적건수
                lnListOut.setBiddingCnt(biddingCntBal.getLastBal());

                lnListOut.setLnRsnCntnt(mthArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_REASON_CONTENT));

                String lnPurposeCd = mthArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
                String p2pInvstmntRatingCd = mthArr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
                String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
                String bidWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue()));

                if(lnPurposeCd != null && !lnPurposeCd.isEmpty()) {
                    lnListOut.setLnPurposeCd(lnPurposeCd);
                    lnListOut.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
                }

                if(p2pInvstmntRatingCd != null && !p2pInvstmntRatingCd.isEmpty()) {
                    lnListOut.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
                    lnListOut.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
                }
                lnListOut.setExctnDt(mthArr.getArrOpnDt());
                lnListOut.setArrMtrtyDt(mthArr.getArrMtrtyDt());
                if(rpymntWayCd != null && !rpymntWayCd.isEmpty()) {
                    lnListOut.setRpymntWayCd(rpymntWayCd);
                    lnListOut.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
                }
                if(bidWayCd != null && !bidWayCd.isEmpty()) {
                    lnListOut.setBiddingMthdCdVal(_getCd().getCode("A0432", bidWayCd));
                    lnListOut.setBiddingMthdCd(bidWayCd);
                }
                lnListOut.setBiddingClsgTmstmp(mthArr.getExtendAttribute(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP));
                lnListOut.setDesiredAmtExcsBidAcceptYn(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN)));
                lnListOut.setDesiredAmtExcsPrmsnMaxAmt(_getArrCndInqryBizProc().getArrangementConditionValue(mthArr.getArrCnd(PdCndEnum.P2P_LOAN_DESIRED_MAXIMUM_AMOUNT)));

                ArrTxInqryDtIn arrTxInqryDtIn = new ArrTxInqryDtIn();
                arrTxInqryDtIn.setInqryStartDt(CCM01.MIN_DATE);
                arrTxInqryDtIn.setInqryEndDt(CCM01.MAX_DATE);
                List<String> amtTpList = new ArrayList<String>();
                amtTpList.add(AmtTpEnum.LN_APLCTN_FEE.getValue());
                arrTxInqryDtIn.setAmtTpCdList(amtTpList);

                List<ArrTx> arrTxList = _getArrTxMngr().getListArrTxWithAmtTp(arrTxInqryDtIn, (ArrReal) mthArr);
                if(arrTxList != null && arrTxList.size() > 0) {
                    lnListOut.setLnAplctnFeeAmt(arrTxList.get(0).getTxAmt());
                }
                ArrBal arrBal = _getArrBalMngr().getArrBal(arrReal, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
                BigDecimal arrBalAmt = arrBal.getLastBal();
                lnListOut.setArrBal(arrBalAmt);

                //investment product code
                lnListOut.setChildPdCd(_getLnBizProc().getChildArrPdCd(mthArr));

                //investment Item Build
                String invstmntCntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arrReal.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
                BigDecimal invstmntCntrtAmt = new BigDecimal(invstmntCntrtAmtStr);

                // Investment Information
                lnListOut.setSubArrId(arrReal.getArrId());
                lnListOut.setInvstmntAmt(invstmntCntrtAmt);

                BigDecimal invstmntRt = ((ArrCndInt) arrReal.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt();
                lnListOut.setInvstmntRt(invstmntRt);
                lnListOut.setInvstmntDt(arrReal.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());


                lnListOut.setExctnDt(mthArr.getArrOpnDt());
                lnListOut.setArrMtrtyDt(mthArr.getArrMtrtyDt());

                ArrBal arrIntBal = _getArrBalMngr().getArrBal(arrReal, AmtTpEnum.DVDND_INCOME.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd);
                BigDecimal invstmntProfitAmt = BigDecimal.ZERO;
                BigDecimal rtrnOnInvstmnt = BigDecimal.ZERO;
                if(arrIntBal != null) {
                    invstmntProfitAmt = arrIntBal.getLastBal();
                }
                lnListOut.setInvstmntProfitAmt(invstmntProfitAmt);

                if(cntrtAmt.compareTo(BigDecimal.ZERO) > 0 && invstmntProfitAmt.compareTo(BigDecimal.ZERO) > 0) {
                    rtrnOnInvstmnt = invstmntProfitAmt.divide(invstmntCntrtAmt, 4, BigDecimal.ROUND_CEILING).multiply(BigDecimal.valueOf(100));
                }
                lnListOut.setRtrnOnInvstmntRt(rtrnOnInvstmnt);
                lnListOutList.add(lnListOut);

                invstmntProfitSumAmt = invstmntProfitSumAmt.add(invstmntProfitAmt);
                invstmntTrmntCnt = invstmntTrmntCnt.add(BigDecimal.ONE);
                invstmntTrmntSumAmt = invstmntTrmntSumAmt.add(invstmntCntrtAmt);
                if(invstmntCntrtAmt.compareTo(BigDecimal.ZERO) > 0 && (invstmntRt != null && invstmntRt.compareTo(BigDecimal.ZERO) > 0)) {
                    invstmntExpctdRtrnOnInvstmnt = invstmntExpctdRtrnOnInvstmnt.add(invstmntCntrtAmt.multiply(invstmntRt));
                }

            }
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setLendingList(lnListOutList);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntTrmntCnt(invstmntTrmntCnt);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntTrmntSumAmt(invstmntTrmntSumAmt);
        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntProfitSumAmt(invstmntProfitSumAmt);

        if(invstmntTrmntSumAmt.compareTo(BigDecimal.ZERO) > 0 && invstmntExpctdRtrnOnInvstmnt.compareTo(BigDecimal.ZERO) > 0) {
            totInvstmntExpctdRtrnOnInvstmnt = invstmntExpctdRtrnOnInvstmnt.divide(invstmntTrmntSumAmt, 2, BigDecimal.ROUND_CEILING);
        }

        LendingListInqrySvcLendingListOutIncludeSmryInfoOut.setInvstmntExpctdRtrnOnInvstmntRt(totInvstmntExpctdRtrnOnInvstmnt);

        return LendingListInqrySvcLendingListOutIncludeSmryInfoOut;
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
     * @return the cd
     */
    private Cd _getCd() {
        if (cd == null) {
            cd = (Cd) CbbApplicationContext.getBean(Cd.class, cd);
        }
        return cd;
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
     * @return the lnBizProc
     */
    private LnBizProc _getLnBizProc() {
        if (lnBizProc == null) {
            lnBizProc = (LnBizProc) CbbApplicationContext.getBean(LnBizProc.class, lnBizProc);
        }
        return lnBizProc;
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
     * @return the cmnContext
     */
    private CmnContext _getCmnContext() {
        if (cmnContext == null) {
            cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
        }
        return cmnContext;
    }

}
