package bankware.corebanking.p2ploan.repayment.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.dto.DummyIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pDstrbtCentercutExctnSvcIn;
import bankware.corebanking.p2ploan.repayment.service.dto.P2pDstrbtSvcDstrbtInfoIn;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 배분 센터컷을 실행하는 서비스를 제공합니다.
 * This class provides for executing distribute center cut.
 *
 * Author	Kisu Kim
 * History
 *  2016.03.09	initial version for 3.0
 */
@BxmService("P2pDstrbtCentercutExctnSvc")
@BxmCategory(logicalName = "P2P Distribute Centercut Execution Service")
@CbbClassInfo(classType={"SERVICE"})
public class P2pDstrbtCentercutExctnSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrMngr		arrMngr;	// Arrangement manager

	/**
	 * 배분 센터컷을 실행합니다.
	 * Execute P2P Distribute Center cut.
	 * <pre>
	 * flow description
	 * 
	 * 1. 부모 계약을 통하여 투자 계약 목록을 조회합니다.
	 * 
	 * 1. Get the investment arrangement list using mother arrangement.
	 * 
	 * 2. 개별 배분 센터컷을 실행합니다.
	 * 
	 * 2. Execute the individual distribute center cut
	 * </pre>
	 * 
	 * @param in (required) P2pDstrbtCentercutExctnSvcIn: Mother arrangement identification, Repayment type distinction code, Total repayment principal, Normal interest, Overdue interest, Early terminate fee, Last yes or no
	 * @return DummyIO Dummy input output
	 * @throws BizApplicationException
	 */
	@BxmServiceOperation("executeP2pDistributeCentercut")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP1091302", srvcNm="Execute P2P Distribute Centercut")
    @BxmCategory(logicalName = "Execute P2P Distribute Centercut")
	public DummyIO executeP2pDistributeCentercut(P2pDstrbtCentercutExctnSvcIn in) throws BizApplicationException {

		/**
		 * Get the loan arrangement
		 */
		Arr lnArr = _getArrMngr().getArr(in.getArrId());

		/**
		 * Get the lending arrangement
		 */
		List<String> lendingArrIdList = _getLendingArrangements(lnArr);

		/**
		 * Generate the center cut data
		 */
		_makeCentercutData();

		/**
		 * Execute the individual center cut
		 */
		_excuteIndividualCentercut(lnArr, lendingArrIdList, in);

		return new DummyIO();
	}

	private List<String> _getLendingArrangements(Arr arr) throws BizApplicationException {

		List<String> lendingArrIdList = new ArrayList<String>();

		for( ArrReal lndArr: arr.getChildren()){
			if(ArrStsEnum.ACTIVE.equals(lndArr.getArrSts())){
				lendingArrIdList.add(lndArr.getArrId());
			}
		}

		return lendingArrIdList;
	}

	private void _makeCentercutData() {

		// TODO
	}

	private void _excuteIndividualCentercut(Arr arr, List<String> lendingArrIdList, P2pDstrbtCentercutExctnSvcIn in) throws BizApplicationException { 

		P2pDstrbtSvcDstrbtInfoIn p2pDstrbtSvcDstrbtInfoIn = null;

		for( String arrId: lendingArrIdList){
			p2pDstrbtSvcDstrbtInfoIn = new P2pDstrbtSvcDstrbtInfoIn();

			p2pDstrbtSvcDstrbtInfoIn.setArrId(arrId);
			p2pDstrbtSvcDstrbtInfoIn.setRpymntTpDscd(in.getRpymntTpDscd());
			p2pDstrbtSvcDstrbtInfoIn.setTotRpymntPrncpl(in.getTotRpymntPrncpl());
			p2pDstrbtSvcDstrbtInfoIn.setNrmlIntAmt(in.getNrmlIntAmt());
			p2pDstrbtSvcDstrbtInfoIn.setOvrduIntAmt(in.getOvrduIntAmt());
			p2pDstrbtSvcDstrbtInfoIn.setErlyTrmntnFeeAmt(in.getErlyTrmntnFeeAmt());
			p2pDstrbtSvcDstrbtInfoIn.setIsLast(in.getIsLast());

			CbbInternalServiceExecutor.execute("SPP1091303", p2pDstrbtSvcDstrbtInfoIn);
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
}
