package bankware.corebanking.p2ploan.repayment.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.loan.financialtransaction.service.dto.LnRpymntSvcRpymntInfoIn;
import bankware.corebanking.loan.financialtransaction.service.dto.LnRpymntSvcRpymntRsltOut;
import bankware.corebanking.loan.query.service.dto.LnRpymntSvcCalcnListOut;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pDstrbtCentercutExctnSvcIn;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pLnRpymntSvcCalcnListOut;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pLnRpymntSvcRpymntInfoIn;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pLnRpymntSvcRpymntRsltOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 클래스는 대출 상환 서비스를 제공합니다.
 * This class provides executing loan repayment service.
 *
 * Author	Kisu Kim
 * History
 *  2016.03.09	initial version for 3.0
 */
@BxmService("P2pLnRpymntSvc")
@BxmCategory(logicalName = "P2P Loan Repayment Service")
@CbbClassInfo(classType={"SERVICE"})
public class P2pLnRpymntSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrBalMngr	arrBalMngr;	// Arrangement balance manager
	private ArrMngr		arrMngr;	// Arrangement manager

	/**
	 * 대출 상환을 실행합니다.
	 * Execute the P2P Loan Repayment.
	 * <pre>
	 * flow description
	 * 
	 * 1. 대출자의 대출을 상환합니다(연동거래).
	 * 
	 * 1. Execute the P2P Loan Repayment(CbbInternalServiceExecutor).
	 * 
	 * 2. 투자자를 위해 배분을 실행합니다(연동거래, 센터컷).
	 * 
	 * 2. Execute the distribution for investor(CbbInternalServiceExecutor, Center cut).
	 * 
	 * 3. 결과를 조립하고 반환합니다.
	 * 
	 * 3. Assemble the output & return.
	 * 
	 * </pre>
	 * 
	 * @param in (required) P2pLnRpymntSvcRpymntInfoIn: Information for loan repayment
	 * @return P2pLnRpymntSvcRpymntRsltOut Loan repayment result
	 * @throws BizApplicationException
	 */
	@CbbSrvcInfo(srvcCd="SPP1091301", srvcNm="P2P Loan Repayment Execution")
	@BxmCategory(logicalName = "P2P Loan Repayment Execution")
	@BxmServiceOperation("executeP2pLoanRepayment")
	@TransactionalOperation
	public P2pLnRpymntSvcRpymntRsltOut executeP2pLoanRepayment(P2pLnRpymntSvcRpymntInfoIn in) throws BizApplicationException{

		/**
		 * Get the arrangement
		 */
		Arr arr = _getArrangementByAccountNumber(in);

		/**
		 * Get the currency code
		 */
		String crncyCd = ((ArrCndLst) arr.getArrCnd(PdCndEnum.CURRENCY.getValue())).getListCd();

		/**
		 * Call the loan repayment method
		 */
		LnRpymntSvcRpymntRsltOut lnRpymntSvcRpymntRsltOut = _executeLoanRepaymentService(in);

		/**
		 * Execute the center cut
		 */
		_excuteCentercut(arr, crncyCd, in, lnRpymntSvcRpymntRsltOut);

		/**
		 * Assemble the output & return
		 */
		return _assembleOutput(lnRpymntSvcRpymntRsltOut);
	}

	private Arr _getArrangementByAccountNumber(P2pLnRpymntSvcRpymntInfoIn in) throws BizApplicationException {

		Arr arr = null;

		arr = _getArrMngr().getArr(in.getAcctNbr(), null);

		if (arr== null){
			throw new BizApplicationException("AAPARE0007", null);
		}

		if (!arr.isActive()){
			throw new BizApplicationException("AAPARE0093",null);
		}

		return arr;
	}

	private LnRpymntSvcRpymntRsltOut _executeLoanRepaymentService(P2pLnRpymntSvcRpymntInfoIn in) throws BizApplicationException {

		LnRpymntSvcRpymntInfoIn lnRpymntSvcRpymntInfoIn = new LnRpymntSvcRpymntInfoIn();

		lnRpymntSvcRpymntInfoIn.setRpymntTpDscd(in.getRpymntTpDscd());
		lnRpymntSvcRpymntInfoIn.setAcctNbr(in.getAcctNbr());
		lnRpymntSvcRpymntInfoIn.setRpymntAmt(in.getRpymntAmt());
		lnRpymntSvcRpymntInfoIn.setRpymntDt(in.getRpymntDt());
		lnRpymntSvcRpymntInfoIn.setWhdrwlAcctNbr(in.getWhdrwlAcctNbr());
		lnRpymntSvcRpymntInfoIn.setCupldPymntYn(in.getCupldPymntYn());
		lnRpymntSvcRpymntInfoIn.setRltdAcctAutoRpymntYn(in.getRltdAcctAutoRpymntYn());

		return CbbInternalServiceExecutor.execute("SLN0414001", lnRpymntSvcRpymntInfoIn);
	}

	private void _excuteCentercut(Arr arr, String crncyCd, P2pLnRpymntSvcRpymntInfoIn in, LnRpymntSvcRpymntRsltOut lnRpymntSvcRpymntRsltOut) throws BizApplicationException {

		P2pDstrbtCentercutExctnSvcIn p2pDstrbtCentercutExctnSvcIn = new P2pDstrbtCentercutExctnSvcIn();

		p2pDstrbtCentercutExctnSvcIn.setArrId(arr.getArrId());
		p2pDstrbtCentercutExctnSvcIn.setRpymntTpDscd(in.getRpymntTpDscd());
		p2pDstrbtCentercutExctnSvcIn.setTotRpymntPrncpl(lnRpymntSvcRpymntRsltOut.getTotRpymntPrncpl());
		p2pDstrbtCentercutExctnSvcIn.setNrmlIntAmt(lnRpymntSvcRpymntRsltOut.getNrmlIntAmt());
		p2pDstrbtCentercutExctnSvcIn.setOvrduIntAmt(lnRpymntSvcRpymntRsltOut.getOvrduIntAmt());
		p2pDstrbtCentercutExctnSvcIn.setErlyTrmntnFeeAmt(lnRpymntSvcRpymntRsltOut.getErlyTrmntnFeeAmt());

		String isLast = CCM01.NO;
		if(_getArrBalMngr().getArrPrincipalBal(arr, crncyCd).getLastBal().compareTo(BigDecimal.ZERO) == 0) {
			isLast = CCM01.YES;
		}
		p2pDstrbtCentercutExctnSvcIn.setIsLast(isLast);

		// 온라인 형태로 테스트 하기 위해 Async --> Sync로 변경
		// TA Center Cut 아키텍쳐 만든 후 가이드 받아서 처리
		//CbbInternalServiceExecutor.executeAsync("SPP1071202", lnAgrmntCentercutExctnSvcIn, 1800000);
		CbbInternalServiceExecutor.execute("SPP1091302", p2pDstrbtCentercutExctnSvcIn);
	}

	private P2pLnRpymntSvcRpymntRsltOut _assembleOutput(LnRpymntSvcRpymntRsltOut lnRpymntSvcRpymntRsltOut) {

		P2pLnRpymntSvcRpymntRsltOut out = new P2pLnRpymntSvcRpymntRsltOut();
		List<P2pLnRpymntSvcCalcnListOut> p2pLnRpymntSvcCalcnListOuts = new ArrayList<P2pLnRpymntSvcCalcnListOut>();

		out.setAcctNbr(lnRpymntSvcRpymntRsltOut.getAcctNbr());
		out.setPdCd(lnRpymntSvcRpymntRsltOut.getPdCd());
		out.setPdNm(lnRpymntSvcRpymntRsltOut.getPdNm());
		out.setCrncyCd(lnRpymntSvcRpymntRsltOut.getCrncyCd());
		out.setWhdrwlAcctNbr(lnRpymntSvcRpymntRsltOut.getWhdrwlAcctNbr());
		out.setWhdrwlAcctOwnrNm(lnRpymntSvcRpymntRsltOut.getWhdrwlAcctOwnrNm());
		out.setTotRpymntPrncpl(lnRpymntSvcRpymntRsltOut.getTotRpymntPrncpl());
		out.setNrmlIntAmt(lnRpymntSvcRpymntRsltOut.getNrmlIntAmt());
		out.setRtrnIntAmt(lnRpymntSvcRpymntRsltOut.getRtrnIntAmt());
		out.setOvrduIntAmt(lnRpymntSvcRpymntRsltOut.getOvrduIntAmt());
		out.setIntSumAmt(lnRpymntSvcRpymntRsltOut.getIntSumAmt());
		out.setLastIntCalcnDt(lnRpymntSvcRpymntRsltOut.getLastIntCalcnDt());
		out.setErlyTrmntnFeeAmt(lnRpymntSvcRpymntRsltOut.getErlyTrmntnFeeAmt());
		out.setRpymntAfPrncplBal(lnRpymntSvcRpymntRsltOut.getRpymntAfPrncplBal());
		out.setTotRpymntAmt(lnRpymntSvcRpymntRsltOut.getTotRpymntAmt());
		out.setAplyIntRt(lnRpymntSvcRpymntRsltOut.getAplyIntRt());
		out.setWhdrwlAcctBal(lnRpymntSvcRpymntRsltOut.getWhdrwlAcctBal());
		out.setTxDt(lnRpymntSvcRpymntRsltOut.getTxDt());
		out.setTxSeqNbr(lnRpymntSvcRpymntRsltOut.getTxSeqNbr());

		for(int i = 0; i < lnRpymntSvcRpymntRsltOut.getHstList().size(); i++) {
			LnRpymntSvcCalcnListOut lnRpymntSvcCalcnListOut = lnRpymntSvcRpymntRsltOut.getHstList().get(i);
			P2pLnRpymntSvcCalcnListOut p2pLnRpymntSvcCalcnListOut = new P2pLnRpymntSvcCalcnListOut();

			p2pLnRpymntSvcCalcnListOut.setSeqNbr(lnRpymntSvcCalcnListOut.getSeqNbr());
			p2pLnRpymntSvcCalcnListOut.setAmtTpCdNm(lnRpymntSvcCalcnListOut.getAmtTpCdNm());
			p2pLnRpymntSvcCalcnListOut.setCalcnBaseAmt(lnRpymntSvcCalcnListOut.getCalcnBaseAmt());
			p2pLnRpymntSvcCalcnListOut.setSctnStartDt(lnRpymntSvcCalcnListOut.getSctnStartDt());
			p2pLnRpymntSvcCalcnListOut.setSctnEndDt(lnRpymntSvcCalcnListOut.getSctnEndDt());
			p2pLnRpymntSvcCalcnListOut.setAplyIntRt(lnRpymntSvcCalcnListOut.getAplyIntRt());
			p2pLnRpymntSvcCalcnListOut.setRpymntSchdldDt(lnRpymntSvcCalcnListOut.getRpymntSchdldDt());
			p2pLnRpymntSvcCalcnListOut.setRpymntSchdldAmt(lnRpymntSvcCalcnListOut.getRpymntSchdldAmt());
			p2pLnRpymntSvcCalcnListOut.setRpymntAmt(lnRpymntSvcCalcnListOut.getRpymntAmt());
			p2pLnRpymntSvcCalcnListOut.setRpymntStsCd(lnRpymntSvcCalcnListOut.getRpymntStsCd());

			p2pLnRpymntSvcCalcnListOuts.add(p2pLnRpymntSvcCalcnListOut);
		}

		out.setHstList(p2pLnRpymntSvcCalcnListOuts);

		return out;
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
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
	}
}
