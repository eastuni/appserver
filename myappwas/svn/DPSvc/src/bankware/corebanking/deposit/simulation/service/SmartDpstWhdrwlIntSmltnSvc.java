package bankware.corebanking.deposit.simulation.service;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.settlement.interestcalculationdeposit.interfaces.dto.IntSmltnOut;
import bankware.corebanking.core.settlement.interestcalculationdeposit.interfaces.dto.IntSmltnOutSub;
import bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcIn;
import bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOut;
import bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub;
import bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.interestcalculationdeposit.interfaces.DpstIntSimulator;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;


/**
 * SmartDpstInqrySvc
 * 
 * This service program is Smart Deposit Withdrawal Interest Simulation Service.
 * 
 * It provides function which are "simulateSmartDepositWithdrawalInterest".
 * 
 * @author H.LEE
 * @history
 * <br> 2016. 8. 31. initial
 */
@BxmService("SmartDpstWhdrwlIntSmltnSvc")
@BxmCategory(logicalName = "Smart Deposit Withdrawal Interest Simulation Service", description = "Smart Deposit Withdrawal Interest Simulation Service")
@CbbClassInfo(classType = "SERVICE")
public class SmartDpstWhdrwlIntSmltnSvc {


	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private ArrMngr             			arrMngr;
	private CmnContext						cmnContext;
	private ArrBalMngr						arrBalMngr;
	private DpstIntSimulator				dpstIntSimulator;


	/**
	 * simulateSmartDepositWithdrawalInterest
	 * 
	 * flow description
	 * 
	 * 1. Get smart deposit arrangement
	 * 
	 * 2. Assemble and return service output
	 *    2.1 Get simulated smart deposit interest list
	 *    2.2 Assemble and return service output
	 * 
     * @param	SmartDpstWhdrwlIntSmltnSvcIn : Smart deposit withdrawal interest simulation service input data
     * @return	SmartDpstWhdrwlIntSmltnSvcOut : Smart deposit withdrawal interest simulation service output data
     * @throws	BizApplicationException
     */
	@BxmServiceOperation("simulateSmartDepositWithdrawalInterest")
    @TransactionalOperation
    @CbbSrvcInfo(srvcCd = "SDP0800412", srvcNm = "Simulate Smart Deposit Withdrawal Interest", srvcAbrvtnNm = "simulateSmartDepositWithdrawalInterest",productLine="DIRECT_BANKING")
    public SmartDpstWhdrwlIntSmltnSvcOut simulateSmartDepositWithdrawalInterest(SmartDpstWhdrwlIntSmltnSvcIn in) throws BizApplicationException{


		/**
         * Get smart deposit arrangement
         */
        Arr arr = _getArrMngr().getArr(in.getArrId());


        /**
         * Assemble and return service output
         */
        return _makeServiceOutput(in, arr);
	}


    /**
     * Assemble and return service output
     *
     * @param	SmartDpstWhdrwlIntSmltnSvcIn : Smart deposit withdrawal interest simulation service input data
     * @param	Arr : Smart deposit arrangement
     * @return	SmartDpstQrySvcOut : Smart deposit inquiry service output data
     * @throws	BizApplicationException
     */
	private SmartDpstWhdrwlIntSmltnSvcOut _makeServiceOutput(SmartDpstWhdrwlIntSmltnSvcIn in, Arr arr) throws BizApplicationException {


		SmartDpstWhdrwlIntSmltnSvcOut out = new SmartDpstWhdrwlIntSmltnSvcOut();		
		if (StringUtils.isEmpty(in.getBaseDt()))  in.setBaseDt(_getCmnContext().getTxDate());


		/**
         * Get simulated smart deposit interest list
         */
		List<IntSmltnOut> IntSmltnOutList = _getDpstIntSimulator().getInterestSimulation(arr, in.getBaseDt(), in.getOprtnTrmCnt(),
				null != in.getTxAmt() ? in.getTxAmt() : _getArrBalMngr().getArrPrincipalBal(arr,  arr.getCrncyCd()).getLastBal());


		// logger test
		if(logger.isDebugEnabled()){
			logger.debug("ksh simulation : IntSmltnOutList : {}", IntSmltnOutList);
		}


		/**
         * Assemble and return service output
         */
		List<SmartDpstWhdrwlIntSmltnSvcOutSub> intSmltnList = new ArrayList<SmartDpstWhdrwlIntSmltnSvcOutSub>();


		BigDecimal baseInt = BigDecimal.ZERO;
		for(IntSmltnOut intSmltnOut : IntSmltnOutList){


			SmartDpstWhdrwlIntSmltnSvcOutSub sub = new SmartDpstWhdrwlIntSmltnSvcOutSub();


			sub.setBaseDt(intSmltnOut.getBaseDt());
			sub.setIntAmt(intSmltnOut.getIntAmt());


			// Difference in interest amount
			if (in.getBaseDt().equals(intSmltnOut.getBaseDt())) {
				sub.setDfrncAmt(BigDecimal.ZERO);
				baseInt = intSmltnOut.getIntAmt();
			}


			sub.setDfrncAmt(sub.getIntAmt().subtract(baseInt));
			
			List<SmartDpstWhdrwlIntSvcList> list = new ArrayList<SmartDpstWhdrwlIntSvcList>();
			
			for(IntSmltnOutSub subList : intSmltnOut.getIntSmltnSubList()){
				
				SmartDpstWhdrwlIntSvcList svcOut = new SmartDpstWhdrwlIntSvcList();
				
				svcOut.setCalcnStartDt(subList.getCalcnStartDt());
				svcOut.setCalcnEndDt(subList.getCalcnEndDt());
				svcOut.setAplyIntRt(subList.getAplyIntRt());
				svcOut.setCalcnBaseAmt(subList.getCalcnBaseAmt());
				svcOut.setIntAmt(subList.getIntAmt());
				svcOut.setNxtLvlAdventAmt(subList.getNxtLvlAdventAmt());
				
				list.add(svcOut);
			}

			sub.setIntSmltnSubList(list);
			
			intSmltnList.add(sub);
		}


		out.setIntSmltnList(intSmltnList);


		return out;
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
	 * @return the cmnContext
	 */
	private CmnContext _getCmnContext() {
		if (cmnContext == null) {
			cmnContext = (CmnContext) CbbApplicationContext.getBean(
					CmnContext.class, cmnContext);
		}
		return cmnContext;
	}


	/**
	 * @return the arrBalMngr
	 */
	private ArrBalMngr _getArrBalMngr() {
		if (arrBalMngr == null) {
			arrBalMngr = (ArrBalMngr) CbbApplicationContext.getBean(
					ArrBalMngr.class, arrBalMngr);
		}
		return arrBalMngr;
	}


	/**
	 * @return the fnclCalculatorDpst
	 */
	private DpstIntSimulator _getDpstIntSimulator() {
		if (dpstIntSimulator == null) {
			dpstIntSimulator = (DpstIntSimulator) CbbApplicationContext.getBean(
					DpstIntSimulator.class, dpstIntSimulator);
		}
		return dpstIntSimulator;
	}


}
