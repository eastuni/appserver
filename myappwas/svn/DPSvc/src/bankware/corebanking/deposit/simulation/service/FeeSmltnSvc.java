package bankware.corebanking.deposit.simulation.service;


import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParm;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParmMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrVrtl;
import bankware.corebanking.arrangement.enums.ArrCustRelEnum;
import bankware.corebanking.arrangement.enums.ArrRelKndEnum;
import bankware.corebanking.calculator.feecalculation.interfaces.CrCalculationMaster;
import bankware.corebanking.calculator.feecalculation.interfaces.dto.CalculationFeeIn;
import bankware.corebanking.calculator.feecalculation.interfaces.dto.FeeCalcnVal;
import bankware.corebanking.calculator.feecalculation.interfaces.dto.FeeCalculatorOut;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.enums.InstParamEnum;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrBsicCrtn;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrCrtnIn;
import bankware.corebanking.core.arrangement.arrangementcondition.interfaces.dto.ArrCndCrtn;
import bankware.corebanking.core.arrangement.arrangementrelationship.interfaces.dto.ArrRelCrtn;
import bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcIn;
import bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOut;
import bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.product.enums.PdCndEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * <div class='en'>
 * @description 
 * <pre>
 * This class provides a function to calculates  fee simulation
 * 2015.05.21   initial
 * 2015.07.02   documentation
 * 2015.10.22   maintain fee inquiry logic for calculating levy fee of small account by CSJ
 * 2015.12.01   add item of calculation detail type to queried result by CSJ
 * 2015.12.15   add two ways(arrangement id, product code) of input data for simulating fee amount by CSJ
 * 2016.06.02	move class to FeeSmltnSvc from StlmntInqSvc
 * </pre>
 * @seealso {@link IntSmltnSvc} : Inquiry interest Service
 * @function SDP0060400 {@link #simulateFeeCalculation(FeeSmltnSvcIn)} : Inquiry fee simulation
 * @note 
 * </div>
 * <div class='ko'>
 * @description 
 * <pre>
 * 이 클래스는 수수료 시뮬레이션 기능을 제공한다. 
 * </pre>
 * @seealso {@link IntSmltnSvc} : 이자 예상 조회
 * @function SDP0060400 {@link #simulateFeeCalculation(FeeSmltnSvcIn)} : 수수료 예상 조회
 * @note 
 * </div>
 * @since 3.0.0
 */
@BxmService("FeeSmltnSvc")
@BxmCategory(logicalName="Fee simulation Service")
@CbbClassInfo(classType="SERVICE")
public class FeeSmltnSvc {


	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private ArrMngr				arrMngr;
	private CmnContext        	cmnContext;
	private CrCalculationMaster	crCalculationMaster;
	private InstParmMngr	    instParmMngr;
	
	  /**
     * <div class='en'>
     * @description
     * <pre>
     * This service is to simulate results of fee calculation. 
     * </pre>
     * @seealso {@link IntSmltnSvc} : Interest Simulation Service
     * @flow
     * <pre>
     * 1. Get target arrangement by account number  
     *    1.1. If arrangement is not exist, create virtual arrangement
     *         {@link bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr#openArrVrtl(ArrCrtnIn)}
     * 2. Call API to inquiry fee simulation
     *    {@link bankware.corebanking.calculator.feecalculation.interfaces.CrCalculationMaster#calculateTxFee(String,Arr,CalculationFeeIn,boolean)}
     * 3. Assemble and return service output
     * </pre>
     * @note 
     * </div>
     * <div class='ko'>
     * @description
     * <pre>
     * 이 서비스는  수신이자 시뮬레이션 기능을 제공한다. 
     * </pre>
     * @seealso {@link IntSmltnSvc} : 이자 예상 조회 
     * @flow
     * 1. 계좌번호로 조회대상 계약 객체를 가져온다.
     *    1.1. 계약이 존재하지 않을 경우, 가상계약을 생성한다. 
     *         {@link bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr#openArrVrtl(ArrCrtnIn)}
     * 2. 수수료 예상 조회하는 API를 호출한다.
     *    {@link bankware.corebanking.calculator.feecalculation.interfaces.CrCalculationMaster#calculateTxFee(String,Arr,CalculationFeeIn,boolean)}
     * 3. 서비스 출력값을 조립한다. 
     * </pre>
     * @note 
     * </div>
     * @param  FeeSmltnSvcIn (required) : 
     * @return FeeSmltnSvcOut : Service result information
     * @throws AAPDPE0062 : Please, Check your account number or product.
     * @since 3.0.0
     * @example 
     * <pre>
     * - Input JSON 
     *   "FeeSmltnSvcIn" : {
     *   }
     * - Output JSON
     *   "FeeSmltnSvcOut" :{
     *   }
     * </pre>
     */
	@BxmServiceOperation("simulateFeeCalculation")
	@TransactionalOperation
    @CbbSrvcInfo(srvcCd="SDP0060400", srvcNm="Simulate Fee Calculation", srvcAbrvtnNm="simulateFeeCalculation")
	public FeeSmltnSvcOut simulateFeeCalculation(FeeSmltnSvcIn in) throws BizApplicationException { 


		/**
		 * Get arrangement
		 */
		Arr arr = _getArr(in.getAcctNbr());


		/**
		 * If arrangement is not exist, create virtual arrangement
		 */
		// The arrVrtl is never used. by kjp
//		ArrVrtl arrVrtl = _createVirtualArr(in, arr);
		_createVirtualArr(in, arr);

        /** 
		 * Simulate service fee
		 */
		FeeCalculatorOut feeOut = new FeeCalculatorOut();
		if(arr != null){
			// The arrVrtl is never used. by kjp
//			FeeCalculatorOut feeOut = _simulateServiceFee(in, arr, arrVrtl);
			feeOut = _simulateServiceFee(in, arr);
		}


		/**
    	 * Assemble and return service output
    	 */
		return _makeServiceOutput(feeOut);
	}


	/**
	 * Get arrangement or Create virtual arrangement
	 * 
	 * @param	AcctNbr : account number
	 * @return	Arr : arrangement object
	 * @throws	BizApplicationException
	 */
	private Arr _getArr(String acctNbr) throws BizApplicationException {


		if (acctNbr.isEmpty()) return null;


		Arr arr = _getArrMngr().getArr(acctNbr, null);


		return arr;
	}


	/**
	 * If arrangement is not exist, create virtual arrangement
	 * 
     * @param	StlmntInqSvcFeeCalcnIn : simulate interest calculation inquiry service result information
     * @param	Arr : arrangement object
     * @return	ArrVrtl : virtual arrangement
     * @throws	BizApplicationException
     */
	private ArrVrtl _createVirtualArr(FeeSmltnSvcIn in, Arr arr) throws BizApplicationException {


		if (arr != null) return null;
		if (in.getPdCd().isEmpty()) throw new BizApplicationException("AAPDPE0062", null);				


		ArrVrtl arrVrtl = _createVirtualArr(in);


		return arrVrtl;		
	}


	/**
	 * Create virtual arrangement
	 * 
     * @param	StlmntInqSvcFeeCalcnIn : simulate interest calculation inquiry service result information
     * @return	ArrVrtl : virtual arrangement
     * @throws	BizApplicationException
     */
	private ArrVrtl _createVirtualArr(FeeSmltnSvcIn in) throws BizApplicationException {


		ArrCrtnIn arrCrtnIn = new ArrCrtnIn();


        /**
         * Assemble arrangement basic information
         */
		arrCrtnIn.setArrBsicCrtn(_setArrBsicCrtn(in.getPdCd()));


        /**
         * Assemble arrangement condition value
         */
        arrCrtnIn.setArrCndList(_setArrCndList(in));


        /**
         * Assemble arrangement relationship
         */
        arrCrtnIn.setArrRelList(_setArrRelList(in));


    	/**
    	 * Create virtual arrangement 
    	 */
		return _getArrMngr().openArrVrtl(arrCrtnIn);
	}


    /**
     * Assemble arrangement basic information
     * 
     * @param	PdCd : product code
     * @return	ArrBsicCrtn : arrangement basic information
     * @throws	BizApplicationException
     */
	private ArrBsicCrtn _setArrBsicCrtn(String pdCd) throws BizApplicationException {


		ArrBsicCrtn arrBsicCrtn = new ArrBsicCrtn();


		arrBsicCrtn.setInstCd(_getCmnContext().getInstCode());
		arrBsicCrtn.setPdCd(pdCd);
		arrBsicCrtn.setCrtnEfctvDt(_getCmnContext().getTxDate());


		return arrBsicCrtn;
	}


    /**
     * Assemble arrangement condition value
     * 
     * @param	StlmntInqSvcFeeCalcnIn : simulate interest calculation inquiry service result information
     * @return	ArrCndCrtnList : arrangement condition value list
     * @throws	BizApplicationException
     */
	private List<ArrCndCrtn> _setArrCndList(FeeSmltnSvcIn in) throws BizApplicationException {


		List<ArrCndCrtn> arrCndCrtnList = new ArrayList<ArrCndCrtn>();
		ArrCndCrtn arrCndCrtn = new ArrCndCrtn();


		InstParm instCrncyCd = _getInstParmMngr().getInstParm(InstParamEnum.INSTITUTION_BASE_CURRENCY_CODE.getValue());


		arrCndCrtn.setCndCd(PdCndEnum.CURRENCY.getValue());
		arrCndCrtn.setTxtCndVal(instCrncyCd.getParmValue());


		arrCndCrtnList.add(arrCndCrtn);


		return arrCndCrtnList;
	}


    /**
     * Assemble arrangement relationship
     * 
     * @param	StlmntInqSvcFeeCalcnIn : simulate interest calculation inquiry service result information
     * @return	ArrRelCrtnList : arrangement relationship list
     * @throws	BizApplicationException
     */
	private List<ArrRelCrtn> _setArrRelList(FeeSmltnSvcIn in) {


		List<ArrRelCrtn> arrRelCrtnList = new ArrayList<ArrRelCrtn>();
		ArrRelCrtn arrRelCrtn = new ArrRelCrtn();


		if(StringUtils.isEmpty(in.getCustId())) return arrRelCrtnList;


		arrRelCrtn.setArrRelCd(ArrCustRelEnum.MAIN_CONTRACTOR.getValue());
		arrRelCrtn.setRltdBizObjId(in.getCustId());
		arrRelCrtn.setArrRelKndCd(ArrRelKndEnum.CUSTOMER.getValue());


		arrRelCrtnList.add(arrRelCrtn);


		return arrRelCrtnList;
	}


    /** 
	 * Simulate service fee
	 * 
     * @param	StlmntInqSvcFeeCalcnIn : simulate interest calculation inquiry service result information
     * @param	Arr : arrangement object
     * @return	ArrRelCrtnList : arrangement relationship list
     * @throws	BizApplicationException
	 */
	private FeeCalculatorOut _simulateServiceFee(FeeSmltnSvcIn in, Arr arr) throws BizApplicationException {
		
		CalculationFeeIn calFeeInput = new CalculationFeeIn();

		calFeeInput.setTxBaseDt(_getCmnContext().getTxDate());   // 필수
		calFeeInput.setInstCd(arr.getInstCd());                  // 필수
		calFeeInput.setTxAmt(in.getTxAmt());                    // 필수
		calFeeInput.setTxCrncyCd(arr.getCrncyCd());            // 필수
		calFeeInput.setLevyCrncyCd(_getInstParmMngr().getInstParm(InstParamEnum.INSTITUTION_BASE_CURRENCY_CODE.getValue()).getParmValue());	 // 필수	
		calFeeInput.setPdCd(arr.getPdCd());       // 필수
		calFeeInput.setTxSeqNbr(0);        // 필수
		calFeeInput.setTxHms(_getCmnContext().getTxHhmmss());
		calFeeInput.setCashTransfer(null);

		if (logger.isDebugEnabled()) {
			logger.debug("HHH _calculateServiceFee  ==> calFeeInput = {}", calFeeInput );
		}


		return _getCalFee().calculateTxFee(in.getArrSrvcTpCd(), arr, calFeeInput, true);
//		if (arrVrtl != null) return _getCalFee().calculateTxFee(in.getArrSrvcTpCd(), arr, calFeeInput, true);

	}


	/**
	 * Assemble and return service output
	 *  
     * @param	FeeCalculatorOut : calculated fee output
     * @return	FeeSmltnSvcOut : simulate interest calculation inquiry service result information
     * @throws	BizApplicationException
	 */
	private FeeSmltnSvcOut _makeServiceOutput(FeeCalculatorOut feeOut) throws BizApplicationException {		


		FeeSmltnSvcOut out = new FeeSmltnSvcOut();


		List<FeeSmltnSvcOutSub> feeList = new ArrayList<FeeSmltnSvcOutSub>();


		if (feeOut != null && !feeOut.getFeeCalcnVal().isEmpty()) {
			for (FeeCalcnVal feeCalcnVal : feeOut.getFeeCalcnVal()) {


				FeeSmltnSvcOutSub sub = new FeeSmltnSvcOutSub();


				sub.setFeeCndCd(feeCalcnVal.getFeeCndCd());
				sub.setFeeCndNm(feeCalcnVal.getFeeCndNm());
				sub.setBsicFeeAmt(feeCalcnVal.getBsicFeeAmt());
				sub.setDscntFeeAmt(feeCalcnVal.getFeeDscntAmt());
				sub.setLevyFeeAmt(sub.getBsicFeeAmt().subtract(sub.getDscntFeeAmt()));
				feeList.add(sub);
			}
		}


		out.setFeeList(feeList);


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
	 * @return the crCalculationMaster
	 */
	private CrCalculationMaster _getCalFee() {
		if (crCalculationMaster == null) {
			crCalculationMaster = (CrCalculationMaster) CbbApplicationContext.getBean(CrCalculationMaster.class, crCalculationMaster);
		}
		return crCalculationMaster;
	}


	/**
	 * @return the instParmMgmt
	 */
	private InstParmMngr _getInstParmMngr() {
		if (instParmMngr == null) {
			instParmMngr = (InstParmMngr) CbbApplicationContext.getBean(
					InstParmMngr.class, instParmMngr);
		}
		return instParmMngr;
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
