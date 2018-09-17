package bankware.corebanking.accounting.generalledger.batch;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.generalledger.daobatch.FrgncBalListBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcFrgncEvltnDBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMCoaBatIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.ExRt;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParm;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParmMngr;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.enums.InstParamEnum;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * <pre>
 * This bean sample program provides common code management function.
 * It consists of inquiry, register, modify, delete function.
 * </pre>
 *
 * @file   bankware.corebanking.accounting.generalledger.batch.GlAcctFrngcVldtnProcessor.java
 * @author Yoonyeong
 * @history
 * <br> 2016. 5. 19. initial
 */
@BxmBean("GlAcctFrngcVldtnProcessor")
@Scope("step")
@BxmCategory(logicalName = "Generalledger Foreign Validation Processor", description = "Generalledger Foreign Validation Processor")
@CbbClassInfo(classType = { "ITEM_PROCESSOR" })
public class GlAcctFrngcVldtnProcessor implements ItemProcessor<AcGlMCoaBatIO, AcFrgncEvltnDBatIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private FrgncBalListBat 	frgncBalListBat;
	private ExRt 				exRt;
	private InstParmMngr 		instParmMngr;
	private CmnContext			cmnContext;

	private String 				instCd;
	private String 				baseDt;
	private BigDecimal 			aplyBaseExRt;
	private BigDecimal 			evltnNthNbr;
	
	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException{
		this.instCd = (String)stepExecution.getJobExecution().getExecutionContext().get("instCd");
//		this.deptId = (String)stepExecution.getJobExecution().getExecutionContext().get("deptId");
		this.baseDt = (String)stepExecution.getJobExecution().getExecutionContext().get("baseDt");
	}

	@Override
	public AcFrgncEvltnDBatIO process(AcGlMCoaBatIO inParam) throws Exception {
		
		if(logger.isDebugEnabled()) {
			logger.debug("=================== GlAcctFrngcVldtnProcessor START ===================");
		}
		
		InstParm instParm = _getInstParmMngr().getInstParm(InstParamEnum.INSTITUTION_BASE_CURRENCY_CODE.getValue());
		if(instParm != null) {
			instParm.getParmValue();
		}
		
		// 1. BS확정 전 총계정원장 외화내역 외화평가명세에 insert (평가 전 잔액)
		_insertEvltnBfBal(inParam);
		
		// 2. 점별, 통화코드별, 계정과목코드별로 평가 후 잔액 update
		_updateEvltnAfBal(inParam);
		
		// 3. BS 해당외화 환산잔액 평가손익 산출하고, 일계조립하여 update
		_updateFrgnCrncyEvltnBal(inParam);
	
		return _getFrgncBalListBat().select(instCd, baseDt, inParam.getDeptId(), inParam.getCrncyCd(), inParam.getAcctgDscd(), inParam.getAcctgItmCd(), evltnNthNbr.intValue(), null);
	}
	
	/**
	 * Update Foreign Evaluation Profit/Loss Amount & Register Manual Entry
	 * 평가전잔액과 평가후잔액을 비교하여 외화평가손익 갱신 & 해당외화 BS 계정 비온라인처리
	 * @param inParam
	 * @throws BizApplicationException
	 */
	private void _updateFrgnCrncyEvltnBal(AcGlMCoaBatIO inParam) throws BizApplicationException {
		
		if(logger.isDebugEnabled()) {
			logger.debug("## GlAcctFrngcVldtnProcessor > _updateFrgnCrncyEvltnBal START");
		}
		
		AcFrgncEvltnDBatIO acFrgncEvltnDBatIO = _getFrgncBalListBat().select(instCd, baseDt, inParam.getDeptId(), inParam.getCrncyCd(), inParam.getAcctgDscd(), inParam.getAcctgItmCd(), evltnNthNbr.intValue(), null);
		
		BigDecimal evltnPlAmt = new BigDecimal(0);
		
		if(acFrgncEvltnDBatIO.getEvltnAfBal().compareTo(acFrgncEvltnDBatIO.getEvltnBfBal())>0){
			evltnPlAmt = acFrgncEvltnDBatIO.getEvltnAfBal().subtract(acFrgncEvltnDBatIO.getEvltnBfBal());
			acFrgncEvltnDBatIO.setEvltnProfitAmt(evltnPlAmt);// set [평가이익금액]
		}
		//평가후잔액<평가전환산금액이면 평가손실(입출금구분코드 : 출금)
		else if(acFrgncEvltnDBatIO.getEvltnAfBal().compareTo(acFrgncEvltnDBatIO.getEvltnBfBal())<0){
			evltnPlAmt = acFrgncEvltnDBatIO.getEvltnBfBal().subtract(acFrgncEvltnDBatIO.getEvltnAfBal());
			acFrgncEvltnDBatIO.setEvltnLossAmt(evltnPlAmt);// set [평가손실금액]
		}
		
		_getFrgncBalListBat().updateEvltnAfBal(acFrgncEvltnDBatIO);
	}

	/**
	 * Update Foreign Currency Evaluation After Balance
	 * 총계정잔액에 환율을 곱하여 평가후잔액을 산출하여 외화평가내역을 갱신한다.
	 * @param inParam
	 * @throws BizApplicationException
	 */
	private void _updateEvltnAfBal(AcGlMCoaBatIO inParam) throws BizApplicationException {

		if(logger.isDebugEnabled()) {
			logger.debug("## GlAcctFrngcVldtnProcessor > _updateEvltnAfBal START");
		}
		
		evltnNthNbr = _getFrgncBalListBat().selectEvltnNthNbr(inParam.getInstCd(), inParam.getDeptId(), inParam.getBaseDt());
		AcFrgncEvltnDBatIO inItem = new AcFrgncEvltnDBatIO();
		inItem.setInstCd(instCd);
		inItem.setBaseDt(baseDt);
		inItem.setDeptId(inParam.getDeptId());
		inItem.setCrncyCd(inParam.getCrncyCd());
		inItem.setAcctgDscd(inParam.getAcctgDscd());
		inItem.setAcctgItmCd(inParam.getAcctgItmCd());
		inItem.setEvltnNthNbr(evltnNthNbr);
		
		AcFrgncEvltnDBatIO frgncEvltnDBatIO = _getFrgncBalListBat().select(instCd, baseDt, inParam.getDeptId(), inParam.getCrncyCd(), inParam.getAcctgDscd(), inParam.getAcctgItmCd(), evltnNthNbr.intValue(), null);
			
		inItem.setAplyBaseExRt(aplyBaseExRt);// set [적용기준환율]
		inItem.setGlBal(frgncEvltnDBatIO.getGlBal());
		inItem.setEvltnBfBal(frgncEvltnDBatIO.getEvltnBfBal());
		inItem.setEvltnAfBal(frgncEvltnDBatIO.getGlBal().multiply(aplyBaseExRt));
		
		_getFrgncBalListBat().updateEvltnAfBal(inItem);
		
	}

	/**
	 * Insert Foreign Currency Evaluation Before Balance
	 * 총계정원장 외화 BS로 총계정잔액, 평가전잔액 입력
	 * @param inParam
	 * @throws BizApplicationException
	 */
	private void _insertEvltnBfBal(AcGlMCoaBatIO inParam) throws BizApplicationException {
		
		if(logger.isDebugEnabled()) {
			logger.debug("## GlAcctFrngcVldtnProcessor > _insertEvltnBfBal START");
		}
		
		AcFrgncEvltnDBatIO outParam = new AcFrgncEvltnDBatIO();
		
		_getCmnContext().setHeaderColumn(outParam);
		outParam.setInstCd(inParam.getInstCd());// set [기관코드]
		outParam.setDeptId(inParam.getDeptId());// set [부서식별자]
		outParam.setBaseDt(inParam.getBaseDt());// set [기준년월일]
		// 동일회차 외화평가내역 정보
		List<AcFrgncEvltnDBatIO> sameNthFrgncEvltnInfoList = _getFrgncBalListBat().selectList(inParam.getInstCd(), inParam.getBaseDt(), inParam.getDeptId(), null, null, null, null, outParam.getLastChngGuid());
		
		outParam.setAcctgDscd(inParam.getAcctgDscd());// set [회계구분코드]
		outParam.setAcctgItmCd(inParam.getAcctgItmCd());// set [계정과목코드]
		outParam.setCrncyCd(inParam.getCrncyCd());// set [통화코드]
		
		BigDecimal frgnEvltnNthNbr = _getFrgncBalListBat().selectEvltnNthNbr(inParam.getInstCd(), inParam.getDeptId(), inParam.getBaseDt()); //외화평가내역테이블에 있는 마지막 회차번호		

		if(sameNthFrgncEvltnInfoList.isEmpty()){
			if(frgnEvltnNthNbr == null){ // 회차정보가 없으면 1을 넣어주고
				outParam.setEvltnNthNbr(new BigDecimal(1));// set [평가회차번호]
			}else{ // 있으면 마지막 회차번호에 1을 더해준다
				outParam.setEvltnNthNbr(frgnEvltnNthNbr.add(new BigDecimal(1)));// set [평가회차번호]
			}
		} else {
			outParam.setEvltnNthNbr(sameNthFrgncEvltnInfoList.get(0).getEvltnNthNbr());// set [평가회차번호]
		}
		
		aplyBaseExRt = (BigDecimal)_getExRt().getLastExchangeRateNthInfo(instCd, inParam.getCrncyCd(), baseDt).getDlgBaseExRt(); // 기준매매환율

		if(logger.isDebugEnabled()) {
			logger.debug("## GlAcctFrngcVldtnProcessor > aplyBaseExRt {}", aplyBaseExRt);
		}
		
		outParam.setAplyBaseExRt(aplyBaseExRt);// set [적용기준환율]
		outParam.setGlBal(inParam.getAcctgBal());// set [총계정잔액]
		outParam.setEvltnBfBal(inParam.getExBal());// set [평가전잔액]
		outParam.setEvltnAfBal(BigDecimal.ZERO);
		outParam.setEvltnLossAmt(BigDecimal.ZERO);
		outParam.setEvltnProfitAmt(BigDecimal.ZERO);
		
		
		logger.debug(outParam.getLastChngGuid());
		_getFrgncBalListBat().insert(outParam);
	}

	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution){
		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())){
			if(logger.isDebugEnabled()){
				logger.debug("@AfterStep step COMPLETED");
			}
		}
		if(ExitStatus.FAILED.equals(stepExecution.getExitStatus())){
			if(logger.isDebugEnabled()){
				logger.debug("@AfterStep step FAILED");
			}
		}
		return stepExecution.getExitStatus();
	}

	/**
	 * @return the exRt
	 */
	private ExRt _getExRt() {
		if (exRt == null) {
			exRt = (ExRt) CbbApplicationContext.getBean(ExRt.class, exRt);
		}
		return exRt;
	}

	/**
	 * @return the frgncBalListBat
	 */
	private FrgncBalListBat _getFrgncBalListBat() {
		if (frgncBalListBat == null) {
			frgncBalListBat = (FrgncBalListBat) CbbApplicationContext.getBean(FrgncBalListBat.class, frgncBalListBat);
		}
		return frgncBalListBat;
	}
	
	/**
     * @return the instParmMngr
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
