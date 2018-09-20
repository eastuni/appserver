package bankware.corebanking.deposit.simulation.service;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.settlement.enums.CashTrnsfrEnum;
import bankware.corebanking.core.settlement.interestcalculationdeposit.interfaces.dto.DpstIntCalculatorOut;
import bankware.corebanking.core.settlement.settlement.interfaces.dto.StlmntCalcnDtlIO;
import bankware.corebanking.core.settlement.settlement.interfaces.dto.StlmntDtlIO;
import bankware.corebanking.deposit.query.service.DpstCnsltnQrySvc;
import bankware.corebanking.deposit.query.service.DpstDrwgIntSmltnSvc;
import bankware.corebanking.deposit.query.service.bizproc.DpstCmnQryBizProc;
import bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcIn;
import bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOut;
import bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bankware.corebanking.settlement.enums.InterestTransactionTypeEnum;
import bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;


/**
 * <div class='en'>
 * @description 
 * <pre>
 * This class is to simulate the interest and tax in accordance with interest transaction type.
 * </pre>
 * @seealso {@link DpstCnsltnQrySvc}  : Deposit consultation inquiry service 
 * @seealso {@link DpstDrwgIntSmltnSvc}  : Deposit interest inquiry service 
 * @function SDP0030400 {@link #simulateInterestCalculation(IntSmltnSvcIn)} : Simulation intersert calculation 
 * @note 
 * </div>
 * <div class='ko'>
 * @description 
 * <pre>
 *  이 클래스는  이자 유형에 따라 시뮬레이션 한 결과(이자 및 세금)을 조회하는 기능을 제공한다. 
 * </pre>
 * @seealso {@link DpstCnsltnQrySvc}  : 수신상담 조회 서비스
 * @seealso {@link DpstDrwgIntSmltnSvc}  : 수신출금 이자계산 시뮬레이션 서비스
 * @function SDP0030400 {@link #simulateInterestCalculation(IntSmltnSvcIn)} : 이자예상 조회
 * @note 
 * </div>
 * @since 3.0.0
 */

@BxmService("IntSmltnSvc")
@BxmCategory(logicalName="Interest Simulation Service")
@CbbClassInfo(classType="SERVICE")
public class IntSmltnSvc {


	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private ArrMngr				arrMngr;
	private DpstIntCalculator	dpstIntCalculator;
	private DpstCmnQryBizProc	dpstCmnQryBizProc;
	private ArrBalMngr 			arrBalMngr;

	
	 /**
     * <div class='en'>
     * @description
     * <pre>
     * This class is to simulate the interest and tax in accordance with interest transaction type.
     * </pre>
     * @seealso {@link DpstCnsltnQrySvc}  : Deposit consultation inquiry service 
     * @seealso {@link DpstDrwgIntSmltnSvc}  : Deposit interest inquiry service 
     * @flow
     * <pre>
     * 1. Get target arrangement by account number of deposit product
     *    1.1. Check if the account is exist and account status is active
     *         {@link bankware.corebanking.arrangement.arrangementcontrol.interfaces.ArrSrvcCntr#validate(ArrSrv, ArrReal)}
     * 2. Calculate interest rates according to the type of interest transaction type
     *    {@link bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator}
     * 3. Assemble and return service output
     * </pre>
     * @note 
     * </div>
     * <div class='ko'>
     * @description
     * <pre>
     * 이 서비스는  계좌의 예상이자를 조회합니다. 
     * </pre>
     * @seealso {@link DpstCnsltnQrySvc}  : 수신상담 조회 서비스 
     * @seealso {@link DpstDrwgIntSmltnSvc}  : 수신출금 이자계산 시뮬레이션 서비스
     * @flow
     * <pre>
     * 1. 계좌번호로 조회 대상의 계약객체를 가져온다. 
     * 2. 이자 거래유형에 따라 각각 이자를 계산한다. (현재: 결산, 가결산,이자지급,부분출금,해지만 지원가능) 
     *    2.1. 이자 거래유형코드가 '결산'인 경우 
     *         {@link bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator#calculateInterestSettlement(Arr, String, String, BigDecimal,Map, boolean)}
     *    2.2. 이자 거래유형코드가 '가결산'인 경우 
     *         {@link bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator#calculateInterestProvisionalSettlement(Arr, String, Map, boolean)
     *    2.3. 이자 거래유형코드가 '이자지급'인 경우
     *         {@link bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator#calculateInterestPayment(Arr, String, int, String, BigDecimal, Map, boolean)
     *    2.4. 이자 거래유형코드가 '부분출금'인 경우
     *         {@link bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator#calculateInterestPartialWithdrawal(Arr, BigDecimal, String, String, BigDecimal,Map, boolean)}
     *    2.5. 이자 거래유형코드가 '해지'인 경우
     *         {@lin bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator#calculateInterestTermination(Arr, String, String, String, BigDecimal, Map, boolean)}
     * 3. 서비스 출력 값을 조립한다.  
     * </pre>
     * @note 
     * </div>
     * @param	IntSmltnSvcIn (required) : Account Number.
     * @return	IntSmltnSvcOut : Service result information.
     * @throws	AAPSTE0048 : This account is a product that can not be interest settlement. 
     * @throws  AAPSTE0100 : The transaction type of interest was not allowed. 
     * @since   3.0.0
     * @example 
     * <pre>
     * - Input JSON
     *   "IntSmltnSvcIn":{"acctNbr":"99910000006857","baseDt":"20171114","arrTrmntnDscd":"","intTxTpCd":"01"}}
     * - Output JSON
     	 "IntSmltnSvcOut" : {
 		"arrOpnDt" : "20171019","arrMtrtyDt" : null,"intCalcnStartDt" : "20171019","intCalcnEndDt" : "20171114","intAmt" : 0,
  		"tax" : 0,"prncpl" : 0,"rvrsdIntAmt" : 0,"rvrsdTax" : 0,"stlmntList" : [ {"instCd" : null,"arrId" : null,"txDt" : null,
    	"txSeqNbr" : 0,"amtTpCd" : "00000","dtlSeqNbr" : 0,"calcnBaseAmt" : 0,"calcnStartDt" : "20171019","calcnEndDt" : "20171114",
    	"calcnDayCnt" : 0,"calcnMnthCnt" : 0,"stlmntDtlTpCntnt" : null,"aplyIntRt" : 0.0,"dpstWhdrwlDscd" : "1","prchsRtrnYn" : "N",
     	"stlmntAmt" : 0}, {"instCd" : null,"arrId" : null,"txDt" : null,"txSeqNbr" : 0,"amtTpCd" : "10100","dtlSeqNbr" : 0,
    	"calcnBaseAmt" : 0,"calcnStartDt" : "20171019","calcnEndDt" : "20171114","calcnDayCnt" : 26,"calcnMnthCnt" : 0,"stlmntDtlTpCntnt" : "약정금리",
    	"aplyIntRt" : 0.1000,"dpstWhdrwlDscd" : "2","prchsRtrnYn" : "N","stlmntAmt" : 0  } ],"custId" : "00000016817C","custNm" : "명선",
  		"crncyCd" : "KRW","pdNm" : "보통예금","arrStsCd" : "A","mgmtDeptId" : "10000","mgmtDeptNm" : "중앙지점"}
     *</pre>
     */
	@BxmServiceOperation("simulateInterestCalculation")
	@TransactionalOperation
    @CbbSrvcInfo(srvcCd="SDP0030400", srvcNm="Interest Calculation Simulation", srvcAbrvtnNm="smltnIntCalcn")
	public IntSmltnSvcOut simulateInterestCalculation(IntSmltnSvcIn in) throws BizApplicationException {


    	/**
         * Get arrangement
         */
        Arr arr = _getArrMngr().getArr(in.getAcctNbr(), null);		


        /** 
		 * Simulate service interest and tax
		 */
        DpstIntCalculatorOut intOut = _simulateServiceInt(in, arr);


		/**
    	 * Assemble and return service output
    	 */
		return _makeServiceOutput(arr, intOut, in.getBaseDt());
	}


	/**
	 * Simulate interest and tax
	 *  
	 * @param  StlmntInqSvcIntCalcnIn : simulate interest calculation inquiry service input data
	 * @param  Arr : arrangement object
	 * @return IntCalculatorDpstOut : calculated interest and tax
	 * @throws BizApplicationException
	 */
	private DpstIntCalculatorOut _simulateServiceInt(IntSmltnSvcIn in, Arr arr) throws BizApplicationException {


		DpstIntCalculatorOut intOut = null;


		switch (InterestTransactionTypeEnum.getEnum(in.getIntTxTpCd())) {
		case SETTLEMENT:
			intOut = _getDpstIntCalculator().calculateInterestSettlement(arr, in.getBaseDt(), CashTrnsfrEnum.TRNSFR.getValue(), BigDecimal.ZERO, null, true);
			break;
		case PROVISIONAL_SETTLEMENT:
			intOut = _getDpstIntCalculator().calculateInterestProvisionalSettlement(arr, in.getBaseDt(), null, true);
			break;
		case INTEREST_PAYMENT:
			intOut = _getDpstIntCalculator().calculateInterestPayment(arr, in.getBaseDt(), 0, CashTrnsfrEnum.TRNSFR.getValue(), BigDecimal.ZERO, null, true);
			break;
		case PARTIAL_WITHDRAWAL:
			intOut = _getDpstIntCalculator().calculateInterestPartialWithdrawal(arr, in.getPrtlWhdrwlAmt(), in.getBaseDt(), CashTrnsfrEnum.TRNSFR.getValue(), BigDecimal.ZERO, null, true);
			break;
		// 2018.07.18. 이자예상조회 화면 및 기능개선에 따라 거래구분콤보에 해지X (해지는 해지이자예상조회에서 한다)
//		case TERMINATION:
//			intOut = _getDpstIntCalculator().calculateInterestTermination(arr, in.getBaseDt(), in.getArrTrmntnDscd(), CashTrnsfrEnum.TRNSFR.getValue(), BigDecimal.ZERO, null, true);				
//			break;
		default:
			throw new BizApplicationException("AAPSTE0100", new Object[] { in.getIntTxTpCd() });
		}


		return intOut;
	}


	/**
	 * Assemble and return service output
	 *
	 * @param Arr : arrangement object
	 * @param IntCalculatorDpstOut : calculated interest and tax
	 * @return StlmntInqSvcIntCalcnOut : simulate interest calculation inquiry service result information
	 * @throws BizApplicationException
	 */
	private IntSmltnSvcOut _makeServiceOutput(Arr arr, DpstIntCalculatorOut intOut, String baseDt) throws BizApplicationException {		


		IntSmltnSvcOut out = new IntSmltnSvcOut();
		out.setCustId(arr.getMainArrCustId());
		out.setCustNm(arr.getMainCust().getName());
		out.setCrncyCd(arr.getCrncyCd());
		out.setPdNm(arr.getPd().getPdNm());
		out.setMgmtDeptId(arr.getMgmtDeptId());
		out.setMgmtDeptNm(arr.getMgmtDept().getDeptName());
		out.setArrStsCd(arr.getArrSts().getValue());
		out.setArrOpnDt(arr.getArrOpnDt());
		out.setArrMtrtyDt(arr.getArrMtrtyDt());
		out.setIntCalcnStartDt(intOut.getIntCalcnStartDt());
		out.setIntCalcnEndDt(intOut.getIntCalcnEndDt());
		ArrBal arrBal= _getArrBalMngr().getArrBal(arr, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), arr.getCrncyCd());
		out.setAcctBal(arrBal.getDailyBal(baseDt));
//		out.setPrncpl(_getAmountByAmountType(AmtTpEnum.PRNCPL.getValue(), false, intOut.getStlmntList()));
		out.setRvrsdIntAmt(_getAmountByAmountType(AmtTpEnum.DPST_INT.getValue(), true, intOut.getStlmntList()));
		out.setRvrsdTax(_getAmountByAmountType(AmtTpEnum.INT_TAX.getValue(), true, intOut.getStlmntList()));
		out.setIntAmt(_getAmountByAmountType(AmtTpEnum.DPST_INT.getValue(), false, intOut.getStlmntList()));
		out.setTax(_getAmountByAmountType(AmtTpEnum.INT_TAX.getValue(), false, intOut.getStlmntList()));


	    /**
	     * Set settlement detail information
	     */
		List<IntSmltnSvcOutSub> stlmntOutList = new ArrayList<IntSmltnSvcOutSub>();
		stlmntOutList = _setSettlementDetailInformation(stlmntOutList, intOut);


		out.setStlmntList(stlmntOutList);


		return out;
	}


	/**
     * Get specific amount by amount type
     * 
	 * @param	AmtTpCd : amount type code
	 * @param	RvrsdYn : check reversed amount or not
	 * @param	StlmntList : settlement list
	 * @return	Amount : specific amount
	 * @throws	BizApplicationException
     */
	private BigDecimal _getAmountByAmountType(String amtTpCd, boolean rvrsdYn, List<StlmntDtlIO> stlmntList) throws BizApplicationException {


		BigDecimal amount = BigDecimal.ZERO;
		String prchsRtrnYn = CCM01.NO;
		if (rvrsdYn) prchsRtrnYn = CCM01.YES;


		for (StlmntDtlIO stlmntDtl : stlmntList) {
			if (amtTpCd.equals(stlmntDtl.getAmtTpCd()) && (prchsRtrnYn.equals(stlmntDtl.getPrchsRtrnYn())))  {
				amount = amount.add(stlmntDtl.getStlmntTotAmt());
			}
		}


		return amount;
	}


    /**
     * Set settlement detail information
     * 
     * @param	StlmntOutList : output sub list
	 * @param	IntCalculatorDpstOut : calculated interest output
	 * @return	StlmntOutList : output sub list
	 * @throws	BizApplicationException
     */
	private List<IntSmltnSvcOutSub> _setSettlementDetailInformation(List<IntSmltnSvcOutSub> stlmntOutList, DpstIntCalculatorOut intOut) throws BizApplicationException {


		for (StlmntDtlIO stlmntDtl : intOut.getStlmntList()) {
			if (stlmntDtl.getStlmntCalcnDList() == null || stlmntDtl.getStlmntCalcnDList().isEmpty()) {


				IntSmltnSvcOutSub sub = new IntSmltnSvcOutSub();


				sub.setAmtTpCd(stlmntDtl.getAmtTpCd());			      	// 금액유형코드
				sub.setPrchsRtrnYn(stlmntDtl.getPrchsRtrnYn());       	// 환입환출여부
				sub.setDpstWhdrwlDscd(stlmntDtl.getDpstWhdrwlDscd());	// 입출금구분코드
				sub.setCalcnBaseAmt(stlmntDtl.getCalcnBaseAmt());	  	// 계산기준금액
				sub.setCalcnStartDt(stlmntDtl.getCalcnStartDt());	  	// 계산시작일
				sub.setCalcnEndDt(stlmntDtl.getCalcnEndDt());		  	// 계산종료일
				sub.setStlmntAmt(stlmntDtl.getStlmntTotAmt());	      	// 정산금액


				stlmntOutList.add(sub);


			} else {
				_setSettlementCalculationDetailInformation(stlmntOutList, stlmntDtl);
			}
		}


		return stlmntOutList;
	}
    /**
     * Set settlement calculation detail information
     * 
	 * @param	StlmntOutList : output sub list
	 * @param	StlmntDtl : settlement detail
	 * @return	Void 
	 * @throws	BizApplicationException
     */
	private void _setSettlementCalculationDetailInformation(List<IntSmltnSvcOutSub> stlmntOutList, StlmntDtlIO stlmntDtl) throws BizApplicationException {


		for (StlmntCalcnDtlIO calcnDtl : stlmntDtl.getStlmntCalcnDList()) {


			IntSmltnSvcOutSub sub = new IntSmltnSvcOutSub();


			sub.setAmtTpCd(stlmntDtl.getAmtTpCd());			                         			// 금액유형코드
			sub.setPrchsRtrnYn(calcnDtl.getPrchsRtrnYn());                           	  		// 환입환출여부
			sub.setDpstWhdrwlDscd(calcnDtl.getDpstWhdrwlDscd());                      	 		// 입출금구분코드
			sub.setCalcnBaseAmt(calcnDtl.getCalcnBaseAmt());	                         		// 계산기준금액
			sub.setCalcnStartDt(calcnDtl.getCalcnStartDt());	                         		// 계산시작일
			sub.setCalcnEndDt(calcnDtl.getCalcnEndDt());		                         		// 계산종료일
			sub.setCalcnDayCnt(calcnDtl.getCalcnDayCnt());	                         			// 운영일수
			sub.setCalcnMnthCnt(calcnDtl.getCalcnMnthCnt());	                         		// 운영월수
			sub.setStlmntDtlTpCntnt(_getDpstCmnQryBizProc().getSettlementDetailType((calcnDtl)));	// 정산상세유형
			sub.setAplyIntRt(calcnDtl.getAplyIntRt());	                             			// 금리
			sub.setStlmntAmt(calcnDtl.getStlmntAmt());		                         			// 정산금액


			stlmntOutList.add(sub);
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
	 * @return the arrMngr
	 */
	private ArrBalMngr _getArrBalMngr() {
		if (arrBalMngr == null) {
			arrBalMngr = (ArrBalMngr) CbbApplicationContext.getBean(ArrBalMngr.class, arrBalMngr);
		}
		return arrBalMngr;
	}


	/**
	 * @return the dpstIntCalculator
	 */
	private DpstIntCalculator _getDpstIntCalculator() {
		if (dpstIntCalculator == null) {
			dpstIntCalculator = (DpstIntCalculator) CbbApplicationContext.getBean(
					DpstIntCalculator.class, dpstIntCalculator);
		}
		return dpstIntCalculator;
	}


	/**
	 * @return the dpstCmnQryBizProc
	 */
	private DpstCmnQryBizProc _getDpstCmnQryBizProc() {
		if (dpstCmnQryBizProc == null) {
			dpstCmnQryBizProc = (DpstCmnQryBizProc) CbbApplicationContext.getBean(
					DpstCmnQryBizProc.class, dpstCmnQryBizProc);
		}
		return dpstCmnQryBizProc;
	}
}
