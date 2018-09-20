package bankware.corebanking.deposit.simulation.service;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.enums.ArrCndActionRequiredValueEnum;
import bankware.corebanking.arrangement.enums.ArrSrvcEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrActionRequiredValue;
import bankware.corebanking.core.arrangement.arrangementcondition.interfaces.dto.ArrCndActionRequiredValue;
import bankware.corebanking.core.settlement.enums.CashTrnsfrEnum;
import bankware.corebanking.core.settlement.interestcalculationdeposit.interfaces.dto.DpstIntCalculatorOut;
import bankware.corebanking.core.settlement.settlement.interfaces.dto.StlmntCalcnDtlIO;
import bankware.corebanking.core.settlement.settlement.interfaces.dto.StlmntDtlIO;
import bankware.corebanking.deposit.close.service.DpstClsSvc;
import bankware.corebanking.deposit.close.service.bizproc.DpstClsBizProc;
import bankware.corebanking.deposit.query.service.DpstCnsltnQrySvc;
import bankware.corebanking.deposit.query.service.DpstDrwgIntSmltnSvc;
import bankware.corebanking.deposit.query.service.bizproc.DpstCmnQryBizProc;
import bankware.corebanking.deposit.query.service.bizproc.dto.DpstCmnQryBizProcArrBsicOut;
import bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcIn;
import bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOut;
import bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.product.enums.pdcondition.PdCndRedepositApplyTargetAmountDscdEnum;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntCalculator;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;


/**
 * <div class='en'>
 * @description 
 * <pre>
 * This class is to simulate the interest and tax in accordance with interest transaction type when closing account.
 * </pre>
 * @seealso {@link DpstCnsltnQrySvc}  : Deposit consultation inquiry service 
 * @seealso {@link DpstDrwgIntSmltnSvc}  : Deposit interest inquiry service 
 * @seealso {@link DpstClsSvc} : Deposit closign service  
 * @function SDP0050400 {@link #inquireDepositClose(ClsSmltnSvcIn)} : Deposit closing simulation service
 * @note 
 * </div>
 * <div class='ko'>
 * @description 
 * <pre>
 *  이 클래스는 계좌 해지 시, 예상되는 이자를 조회하는 기능을 제공한다. 
 * </pre>
 * @seealso {@link DpstCnsltnQrySvc}  : 수신상담 조회 서비스
 * @seealso {@link DpstDrwgIntSmltnSvc}  : 수신출금 이자계산 시뮬레이션 서비스
 * @function SDP0050400 {@link #inquireDepositClose(ClsSmltnSvcIn)} : 해지 예상 조회 
 * @note 
 * </div>
 * @since 3.0.0
 */

@BxmService("ClsSmltnSvc")
@BxmCategory(logicalName="Close Simulation Service")
@CbbClassInfo(classType={"SERVICE"})
public class ClsSmltnSvc {


	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private ArrMngr              	arrMngr;
	private CmnContext        		cmnContext;
	private DpstIntCalculator    	dpstIntCalculator;
	private DpstCmnQryBizProc    	dpstCmnQryBizProc;
	private DpstClsBizProc			dpstClsBizProc;


     /**
	 * <div class='en'>
	 * 
	 * @description
	 * <pre>
	 * This service is to simulate the interest and tax in accordance with interest transaction type when closing account.
	 * </pre>
	 * @seealso {@link DpstCnsltnQrySvc} : Deposit consultation inquiry service
	 * @seealso {@link DpstDrwgIntSmltnSvc} : Deposit interest inquiry service
	 * @seealso {@link DpstClsSvc} : Deposit closign service
	 * @flow 
	 * <pre>
	 * 1. Get target arrangement by account number of deposit product.
	 * 2. Validate termination target account
	 *    {@link bankware.corebanking.arrangement.arrangementcontrol.interfaces.ArrSrvcCntr#validate(ArrSrv, Arr)}
	 *     2.1. Check if the account is active or not
	 *     2.2. Check the password of account if the customer inputs
	 * 3. Validate special condition of deposit partial withdrawal which is related to product conditions
	 *    {@link bankware.corebanking.arrangement.arrangement.interfaces.Arr#doServiceAction(ArrSrv, ArrCndActionRequiredValue)}
	 * 4. Calculate Interest and Tax for the account
	 *     4.1. Set the cash replacement distinction code (cash, replacement or mix)
	 *     4.2. If a termination distinction is 'set-off', set the cash replacement distinction to 'except'
	 *     4.3. Set the inquiry target date to transaction date or reckoning date
	 *     4.4. Calculate the deposit interest and tax  
	 *          {@link bankware.corebanking.settlement.settlement.interfaces.IntCalculatorDpstMngr#calculateIntTrmntn}
	 *     4.5  create the settlement information that was results of calculating the interest and tax
	 *     4.6  store transaction and balance of account and journalizing information  
	 *          3.6.1 check if product of account was restricted due to an accident
	 *          3.6.2 create entries 
	 *          3.6.3 update balance of account in accordance using entries of transaction
	 *          3.6.4 create journalizing information used for accounting later in post process
	 *          3.6.5 create transaction information
	 * 5. Assemble and return service output.
	 * </pre>
	 * @note 
	 * </div> 
	 * <div class='ko'>
	 * @description
	 * <pre>
	 * 이 서비스는  계좌 해지 시, 예상되는 이자를 조회하는 기능을 제공합니다.
	 * </pre>
	 * @seealso {@link DpstCnsltnQrySvc} : 수신상담 조회 서비스
	 * @seealso {@link DpstDrwgIntSmltnSvc} : 수신출금 이자계산 시뮬레이션 서비스
	 * @seealso {@link DpstClsSvc} : 수신해지 서비스
	 * @flow 
	 * <pre>
	 * 1. 계좌번호로 조회 대상의 계약객체를 가져온다. 
	 * 2. 계좌의 유효성을 검증한다.
	 * 3. 상품 조건에 관련된 업무로직을 수행한다.
	 *    {@link bankware.corebanking.arrangement.arrangement.interfaces.Arr#doServiceAction(ArrSrvcEnum, ArrActionRequiredValue)}
	 * 4. 계좌의 이자 및 세금을 계산한다
	 *    4.1. 현금대체구분코드를 설정한다.
	 *    4.2. 상계 해지 시, 현금대체구분코드는 '대체검증제외대상'로 설정한다.
	 *    4.3. 거래일자나 기산일자를 조회가능일자로 설정한다.
	 *    4.4. 이자 및 세금을 계산한다.
	 *    4.5. 계산결과에 따른 분개정보를 생성한다.
	 *    4.6. 계좌 잔액 및 분개정보를 저장한다.
	 *         4.6.1. 거래 입출력 항목을 생성한다.
	 *         4.6.2. 결과에 따라 잔액을 업데이트한다.
	 *         4.6.3. 거래결과를 저장한다. 
	 * 5. 서비스 출력 값을 조립한다.
	 * </pre>
	 * @note 
	 * </div>
	 * @param ClsSmltnSvcIn (required) : Account Number.
	 * @return ClsSmltnSvcOut : Service result information.
	 * @throws AAPSTE0048 : This account is a product that can not be interest settlement.
	 * @since 3.0.0
	 * @example 
	 * <pre>
	 * - Input JSON
	 *   "ClsSmltnSvcIn":{"acctNbr":"99910000006857","ArrTrmntnDscd" :"01","trmntnBaseDt":"20171114"}
	 * - Output Json 
	 *   "ClsSmltnSvcOut" : {
	 *          "xtnAtrbtJsonCntnt" : null, "prncpl" : 0.00, "txAmt" : 0.00,
	 *          "intAmt" : 0, "tax" : 0, "rvrsdIntAmt" : 0, "rvrsdTax" : 0,
	 *          "txDt" : "20180117","txHms" : "161500", "txSeqNbr" : 0, "arrId"
	 *          : "00000016817C999100000012113", "nthNbr" : 0,"arrStsCd" : "A",
	 *          "pdNm" : "보통예금", "custNm" : "명선", "custId" : "00000016817C",
	 *          "arrOpnDt" : "20171019", "arrTrmntnDt" : null, "arrMtrtyDt" :
	 *          null, "aplyIntRt" : 0.1000, "crncyCd" : "KRW", "lastBal" : 0.0,
	 *          "oprtnAcctNbr" : null, "stlmntList" : [ { "amtTpCd" : "00000",
	 *          "prchsRtrnYn" : "N", "dpstWhdrwlDscd" : "2", "calcnBaseAmt" :
	 *          0.00, "calcnStartDt" : "20171019", "calcnEndDt" : "20171114",
	 *          "calcnDayCnt" : 0, "calcnMnthCnt" : 0, "stlmntDtlTpCntnt" :
	 *          null, "aplyIntRt" : 0.0, "stlmntAmt" : 0.00 }, { "amtTpCd" :
	 *          "10100", "prchsRtrnYn" : "N", "dpstWhdrwlDscd" : "2",
	 *          "calcnBaseAmt" : 0, "calcnStartDt" : "20171019", "calcnEndDt" :
	 *          "20171114", "calcnDayCnt" : 26, "calcnMnthCnt" : 0,
	 *          "stlmntDtlTpCntnt" : "약정금리", "aplyIntRt" : 0.1000, "stlmntAmt" :
	 *          0 } ], "mgmtDeptId" : "10000", "mgmtDeptNm" : "중앙지점",
	 *          "rdpstAmtDscd" : "1", "rdpstAmt" : 0.00 } 
	 * </pre>
	 */
	@BxmServiceOperation("inquireDepositClose")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SDP0050400", srvcNm="Inquiry Deposit Closing ", srvcAbrvtnNm="InqDpstClsg")
	public ClsSmltnSvcOut inquireDepositClose(ClsSmltnSvcIn in) throws BizApplicationException {


		/**
         * Get arrangement
         */
        Arr arr = _getArrMngr().getArr(in.getAcctNbr(), null);

        
        /**
         * Determine Termination Distinction Code
         */
        _setTrmntnDscd(in, arr);
        
        
		/**
    	 * Perform the conditions' action which are related service
    	 */
        _doArrCndAction(in, arr);
        

		/** 
		 * Simulate service interest and tax
		 */
        DpstIntCalculatorOut intOut = _simulateServiceInt(in, arr);
		if(logger.isDebugEnabled()) {
		    logger.debug("### intOut: {} ", intOut);
		}


		/**
    	 * Assemble and return service output
    	 */
        return _makeServiceOutput(in, arr, intOut);
	}

	private void _setTrmntnDscd(ClsSmltnSvcIn in, Arr arr) throws BizApplicationException {
		
		if(!in.getArrTrmntnDscd().isEmpty()) return;
		
		String baseDt = (StringUtils.isEmpty(in.getTrmntnBaseDt()) ? _getCmnContext().getTxDate() : in.getTrmntnBaseDt()); 
		if (!StringUtils.isEmpty(in.getRckngDt())) baseDt = in.getRckngDt();
		
		String trmntnDscd = _getDpstClsBizProc().setTrmntnDscd(arr, baseDt);
		
		in.setArrTrmntnDscd(trmntnDscd);
		
	}

	/**
     * Perform the conditions' action which are related service
     * 
	 * @param	ClsSmltnSvcIn : close simulation service input data
	 * @param	Arr : arrangement object
	 * @return	Void
     * @throws	BizApplicationException
     */
	private void _doArrCndAction(ClsSmltnSvcIn in, Arr arr) throws BizApplicationException {	


		ArrActionRequiredValue arrActionRequiredValue = new ArrActionRequiredValue();


		HashMap<String, Object> xtnValMap = new HashMap<String, Object>();
		xtnValMap.put(ArrCndActionRequiredValueEnum.ARR_TRMNTN_DSCD.getValue(), in.getArrTrmntnDscd());


		arrActionRequiredValue.setXtnValMap(xtnValMap);
		arrActionRequiredValue.setRckngDt(in.getRckngDt());


		arr.doServiceAction(ArrSrvcEnum.TERMINATION_DEPOSIT_INQUIRY, arrActionRequiredValue);
	}


	/**
	 * Simulate service interest and tax
	 * 
	 * @param	ClsSmltnSvcIn : close simulation service input data
	 * @param	Arr : arrangement object
	 * @return	IntCalculatorDpstOut : calculated interest output
     * @throws	BizApplicationException
	 */
	private DpstIntCalculatorOut _simulateServiceInt(ClsSmltnSvcIn in, Arr arr) throws BizApplicationException {


		String baseDt = (StringUtils.isEmpty(in.getTrmntnBaseDt()) ? _getCmnContext().getTxDate() : in.getTrmntnBaseDt()); 
		if (!StringUtils.isEmpty(in.getRckngDt())) baseDt = in.getRckngDt();


		return _getDpstIntCalculator().calculateInterestTermination(arr, baseDt, in.getArrTrmntnDscd(), CashTrnsfrEnum.EXCPT_TRNSFR.getValue(), BigDecimal.ZERO, null, true);
	}


	/**
	 * Assemble and return service output
	 *  
     * @param	ClsSmltnSvcIn : close simulation service input data
     * @param	Arr : arrangement object
     * @param	IntCalculatorDpstOut : calculated interest output
     * @return	ClsSmltnSvcOut : close simulation service result information
     * @throws	BizApplicationException
	 */
	private ClsSmltnSvcOut _makeServiceOutput(ClsSmltnSvcIn in, Arr arr, DpstIntCalculatorOut intOut) throws BizApplicationException {		


		// Get arrangement overview information
		DpstCmnQryBizProcArrBsicOut arrBsicOut = _getDpstCmnQryBizProc().queryArrOverviewBasic((ArrReal)arr);


		ClsSmltnSvcOut out = new ClsSmltnSvcOut();


		out.setArrId(arrBsicOut.getArrId());		
    	out.setNthNbr(arrBsicOut.getNthNbr());		
    	out.setArrStsCd(arrBsicOut.getArrStsCd());
    	out.setPdNm(arrBsicOut.getPdNm());   	
    	out.setCustNm(arrBsicOut.getCustNm());
    	out.setCustId(arrBsicOut.getCustId());
    	out.setArrOpnDt(arrBsicOut.getArrOpnDt());
    	out.setArrTrmntnDt(arrBsicOut.getArrTrmntnDt());
    	out.setArrMtrtyDt(arrBsicOut.getArrMtrtyDt());
    	out.setCrncyCd(arrBsicOut.getCrncyCd());
    	out.setAplyIntRt(arrBsicOut.getAplyIntRt());
    	out.setTxDt(_getCmnContext().getTxDate());
		out.setTxHms(_getCmnContext().getTxHhmmss());
		out.setTxAmt(_getTxAmt(intOut.getStlmntList()));
		out.setPrncpl(_getAmountByAmountType(AmtTpEnum.PRNCPL.getValue(), false, intOut.getStlmntList()));
		out.setRvrsdIntAmt(_getAmountByAmountType(AmtTpEnum.DPST_INT.getValue(), true, intOut.getStlmntList()));
		out.setRvrsdTax(_getAmountByAmountType(AmtTpEnum.INT_TAX.getValue(), true, intOut.getStlmntList()));
		out.setIntAmt(_getAmountByAmountType(AmtTpEnum.DPST_INT.getValue(), false, intOut.getStlmntList()));
		out.setTax(_getAmountByAmountType(AmtTpEnum.INT_TAX.getValue(), false, intOut.getStlmntList()));
		out.setTxSeqNbr(intOut.getTxSeqNbr());
		out.setMgmtDeptId(arr.getMgmtDeptId());
		out.setMgmtDeptNm(arr.getMgmtDept().getDeptName());
		
		_setRedepositAmt(arr, out);


		// _executeDepositService?
		Arr oprtnArr = arr.getOperationalAccount();
    	if (oprtnArr != null) {
    		out.setOprtnAcctNbr(oprtnArr.getAcctNbr());
    	}


	    /**
	     * Set settlement detail information
	     */
		List<ClsSmltnSvcOutSub> clsSmltnSvcOutSubList = new ArrayList<ClsSmltnSvcOutSub>();
		clsSmltnSvcOutSubList = _setSettlementDetailInformation(clsSmltnSvcOutSubList, intOut);


		out.setStlmntList(clsSmltnSvcOutSubList);


		return out;
	}
	
	private ClsSmltnSvcOut _setRedepositAmt(Arr arr, ClsSmltnSvcOut out) throws BizApplicationException {
		
		ArrCnd arrCnd = arr.getArrCnd(PdCndEnum.REDEPOSIT_APPLY_TARGET_AMT_DSCD);
		
		String rdpstAmtDscd = "";
		
		if (arrCnd == null || arrCnd.getCndVal() == null) {
			rdpstAmtDscd = PdCndRedepositApplyTargetAmountDscdEnum.CAPITAL.getValue();
		}else{
			rdpstAmtDscd = arrCnd.getCndVal();
		}
		
		out.setRdpstAmtDscd(rdpstAmtDscd);
		
		if (PdCndRedepositApplyTargetAmountDscdEnum.CAPITAL.getValue().equals(rdpstAmtDscd)) {
			out.setRdpstAmt(out.getPrncpl());
		} else {
			out.setRdpstAmt(out.getTxAmt());
		}
		
		return out;
	}


    /**
     * Get transaction amount
     * 
	 * @param	StlmntList : settlement list
	 * @return	TxAmt : transaction amount
	 * @throws	BizApplicationException
     */
	private BigDecimal _getTxAmt(List<StlmntDtlIO> stlmntList) throws BizApplicationException {


		// transaction amount = principal + interest - reversed interest - tax + reversed tax
		BigDecimal txAmt = BigDecimal.ZERO;


	    /**
	     * Get specific amount by amount type
	     */
		txAmt = _getAmountByAmountType(AmtTpEnum.PRNCPL.getValue(), false, stlmntList)
				.add(_getAmountByAmountType(AmtTpEnum.DPST_INT.getValue(), false, stlmntList))
				.subtract(_getAmountByAmountType(AmtTpEnum.DPST_INT.getValue(), true, stlmntList))
				.subtract(_getAmountByAmountType(AmtTpEnum.INT_TAX.getValue(), false, stlmntList))
				.add(_getAmountByAmountType(AmtTpEnum.INT_TAX.getValue(), true, stlmntList));


		return txAmt;
	}


	/**
     * Get specific amount by amount type
     * 
	 * @param	AmtTpCd : amount type code
	 * @param	RvrsdYn : check reversed amount or not
	 * @param	StlmntList : settlement list
	 * @return	amount : specific amount
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
     * @param	ClsSmltnSvcOutSubList : output sub list
	 * @param	IntCalculatorDpstOut : calculated interest output
	 * @return	ClsSmltnSvcOutSubList : output sub list
	 * @throws	BizApplicationException
     */
	private List<ClsSmltnSvcOutSub> _setSettlementDetailInformation(List<ClsSmltnSvcOutSub> clsSmltnSvcOutSubList, DpstIntCalculatorOut intOut) throws BizApplicationException {


		for (StlmntDtlIO stlmntDtl : intOut.getStlmntList()) {
			if (stlmntDtl.getStlmntCalcnDList() == null || stlmntDtl.getStlmntCalcnDList().isEmpty()) {


				ClsSmltnSvcOutSub sub = new ClsSmltnSvcOutSub();


				sub.setAmtTpCd(stlmntDtl.getAmtTpCd());			      	// 금액유형코드
				sub.setPrchsRtrnYn(stlmntDtl.getPrchsRtrnYn());       	// 환입환출여부
				sub.setDpstWhdrwlDscd(stlmntDtl.getDpstWhdrwlDscd());	// 입출금구분코드
				sub.setCalcnBaseAmt(stlmntDtl.getCalcnBaseAmt());	  	// 계산기준금액
				sub.setCalcnStartDt(stlmntDtl.getCalcnStartDt());	  	// 계산시작일
				sub.setCalcnEndDt(stlmntDtl.getCalcnEndDt());		  	// 계산종료일
				sub.setStlmntAmt(stlmntDtl.getStlmntTotAmt());	      	// 정산금액


				clsSmltnSvcOutSubList.add(sub);


			} else {
				_setSettlementCalculationDetailInformation(clsSmltnSvcOutSubList, stlmntDtl);
			}
		}


		return clsSmltnSvcOutSubList;
	}


    /**
     * Set settlement calculation detail information
     * 
	 * @param	ClsSmltnSvcOutSubList : output sub list
	 * @param	stlmntDtl : settlement detail
	 * @return	Void 
	 * @throws	BizApplicationException
     */
	private void _setSettlementCalculationDetailInformation(List<ClsSmltnSvcOutSub> clsSmltnSvcOutSubList, StlmntDtlIO stlmntDtl) throws BizApplicationException {


		for(StlmntCalcnDtlIO calcnD : stlmntDtl.getStlmntCalcnDList()) {


			ClsSmltnSvcOutSub sub = new ClsSmltnSvcOutSub();


			sub.setAmtTpCd(stlmntDtl.getAmtTpCd());			                         		// 금액유형코드
			sub.setPrchsRtrnYn(calcnD.getPrchsRtrnYn());                             		// 환입환출여부
			sub.setDpstWhdrwlDscd(calcnD.getDpstWhdrwlDscd());                       		// 입출금구분코드
			sub.setCalcnBaseAmt(calcnD.getCalcnBaseAmt());	                         		// 계산기준금액
			sub.setCalcnStartDt(calcnD.getCalcnStartDt());	                         		// 계산시작일
			sub.setCalcnEndDt(calcnD.getCalcnEndDt());		                         		// 계산종료일
			sub.setCalcnDayCnt(calcnD.getCalcnDayCnt());	                         		// 운영일수
			sub.setCalcnMnthCnt(calcnD.getCalcnMnthCnt());	                         		// 운영월수
			sub.setStlmntDtlTpCntnt(_getDpstCmnQryBizProc().getSettlementDetailType((calcnD)));	// 정산상세유형
			sub.setAplyIntRt(calcnD.getAplyIntRt());	                             		// 금리
			sub.setStlmntAmt(calcnD.getStlmntAmt());		                         		// 정산금액


			clsSmltnSvcOutSubList.add(sub);
		}
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
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
	}


	/**
	 * @return the intCalculatorDpst
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
	
	/**
	 * @return the dpstClsBizProc
	 */
	private DpstClsBizProc _getDpstClsBizProc() {
		if (dpstClsBizProc == null) {
			dpstClsBizProc = (DpstClsBizProc) CbbApplicationContext.getBean(
					DpstClsBizProc.class, dpstClsBizProc);
		}
		return dpstClsBizProc;
	}
}
