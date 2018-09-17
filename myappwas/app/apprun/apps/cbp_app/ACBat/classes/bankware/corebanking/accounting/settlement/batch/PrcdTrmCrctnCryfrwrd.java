package bankware.corebanking.accounting.settlement.batch;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.settlement.daobatch.AcStlmntGlMBat;
import bankware.corebanking.accounting.settlement.daobatch.dto.AcStlmntGlMBatIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * @file         bankware.corebanking.accounting.settlement.batch.PrcdTrmCrctnCryfrwrd.java
 * @filetype     java source file
 * @brief		  
 * @author       Yoonyeong Ha
 * @version      0.1
 * @history
 * <pre>
 * 버전          				성명                   		일자              			변경내용
 * -------       ----------------       -----------       -----------------
 * 0.1           	Yoonyeong Ha       	2017. 09. 11.       	신규 작성
 * </pre>
 */

@BxmBean("PrcdTrmCrctnCryfrwrd")
@Scope("step")
@BxmCategory(logicalName = "Preceding Term Correction Carryforward", description = "전기보정이월처리")
public class PrcdTrmCrctnCryfrwrd implements Tasklet {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private DateCalculator			dateCalculator;
	private AcStlmntGlMBat 			acStlmntGlMBat;
	private CmnContext				cmnContext;

	@Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {
	
		/*
		 * [전기보정이월처리 배치]
		 * 전기보정액을 결산기준일 원장에 반영하고 폐쇄점과 폐쇄계정을 차감하여 통합점과 통합계정에 합산처리하는 프로세스
		 */
		// 전기보정내역 이월 : 익기 연초첫영업일
		String instCd = _getCmnContext().getInstCode();
		String baseDt = (String)arg1.getStepContext().getJobExecutionContext().get("baseDt"); // 결산일자
		String prcdTrmLastBizDt = _calculatePrcdTrmLastBizDt(baseDt); // 전기마지막영업일자 (본결산일자)
		
		if(logger.isDebugEnabled()) {
			logger.debug("## PrcdTrmCrctnCryfrwrd > START");
			logger.debug("## PrcdTrmCrctnCryfrwrd > instCd : {}", instCd);
			logger.debug("## PrcdTrmCrctnCryfrwrd > baseDt : {}", baseDt);
			logger.debug("## PrcdTrmCrctnCryfrwrd > prcdTrmLastBizDt : {}", prcdTrmLastBizDt);
		}
		
		// 전기보정내역 조회
		List<AcStlmntGlMBatIO> prcdTrmCrctnHstList = _getListPrcdTrmCrctnHst(instCd, prcdTrmLastBizDt);
		
		// 전기보정내역 익기 연초영업일로 이월
		if (!prcdTrmCrctnHstList.isEmpty()) {
			_cryFrwrdPrcdTrmCrctnHst(prcdTrmCrctnHstList, instCd, baseDt);
			
		}
		
		return RepeatStatus.FINISHED;
	}

	/**
	 * TODO 공통팀에 API요청해야함
	 * Calculate Preceding Term Last Business Date
	 * 전기말영업일 계산
	 * @param baseDt
	 * @return
	 * @throws BizApplicationException 
	 */
	private String _calculatePrcdTrmLastBizDt(String baseDt) throws BizApplicationException {
		
	    Calendar cal = Calendar.getInstance();
	    cal.set(Calendar.YEAR, Integer.valueOf(baseDt.substring(0, 4)));
	    cal.set(Calendar.MONTH, 0);
	    cal.set(Calendar.DATE, cal.getActualMinimum(Calendar.DAY_OF_MONTH));
	    SimpleDateFormat format1 = new SimpleDateFormat("yyyyMMdd");
	    // 해당연초일자
	    String thisYrFirstDt = format1.format(cal.getTime());
	    
		return _getDateCalculator().calculateDateBusiness(thisYrFirstDt).getBfBizDt();
	}

	/**
	 * Carryforward Preceding Term Correction History
	 * 전기보정내역이월
	 * @param prcdTrmCrctnHstList
	 * @param baseDt2 
	 * @param prcdTrmLastBizDt 
	 * @throws BizApplicationException 
	 */
	private void _cryFrwrdPrcdTrmCrctnHst(List<AcStlmntGlMBatIO> prcdTrmCrctnHstList, String instCd, String baseDt) throws BizApplicationException {
		
		// 결산기준년월일 결산회차 max값 조회
		Integer maxStlmntNth = _getAcStlmntGlMBat().selectMaxStlmntNth(instCd, baseDt);
		if (logger.isDebugEnabled()) {
			logger.debug("## PrcdTrmCrctnCryfrwrd > _cryFrwrdPrcdTrmCrctnHst > maxStlmntNth : {}", maxStlmntNth);
		}
		
		for (AcStlmntGlMBatIO inItem : prcdTrmCrctnHstList) {
			
			AcStlmntGlMBatIO out = new AcStlmntGlMBatIO();

			_getCmnContext().setHeaderColumn(out);
			
			// 전기보정금액 = 전기온라인미수수익 + 전기온라인미지급비용 + 전기비온라인미수수익 + 전기비온라인미지급비용
			BigDecimal prcdTrmCrctnAmt = inItem.getOnlineAccruedIncomeAmt().add(inItem.getOnlineAccruedExpnsAmt())
					.add(inItem.getManualEntryAccruedIncomeAmt()).add(inItem.getManualEntryAccruedExpnsAmt());

			out.setInstCd(inItem.getInstCd());// set [기관코드]
			out.setStlmntBaseDt(baseDt);// set [결산기준년월일]
			out.setStlmntNth(maxStlmntNth);// set [결산회차]
			out.setDeptId(inItem.getDeptId());// set [부서식별자]
			out.setAcctgDscd(inItem.getAcctgDscd());// set [회계구분코드]
			out.setAcctgItmCd(inItem.getAcctgItmCd());// set [계정과목코드]
			out.setCrncyCd(inItem.getCrncyCd());// set [통화코드]
			out.setPrcdTrmCrctnAmt(prcdTrmCrctnAmt);// set [전기보정금액]
		
			int cnt = _getAcStlmntGlMBat().updatePrcdTrmCrctnAmt(out);
			if (cnt == 0) {
				if (logger.isDebugEnabled()) {
					logger.debug("## PrcdTrmCrctnCryfrwrd > _cryFrwrdPrcdTrmCrctnHst > 전기 이월내역 없음");
				}
			}
		}
	}

	/**
	 * Get List Preceding Term Correction History
	 * 전기말영업일 결산총계정기본목록 조회
	 * @param prcdTrmLastBizDt
	 * @param prcdTrmLastBizDt2 
	 * @return
	 * @throws BizApplicationException 
	 */
	private List<AcStlmntGlMBatIO> _getListPrcdTrmCrctnHst(String instCd, String prcdTrmLastBizDt) throws BizApplicationException {
		
		// 전기 결산기준년월일 결산회차 max값 조회
		Integer maxStlmntNth = _getAcStlmntGlMBat().selectMaxStlmntNth(instCd, prcdTrmLastBizDt);
		if (logger.isDebugEnabled()) {
			logger.debug("## PrcdTrmCrctnCryfrwrd > _getListPrcdTrmCrctnHst > maxStlmntNth : {}", maxStlmntNth);
		}
		
		AcStlmntGlMBatIO acStlmntGlMBatIO = new AcStlmntGlMBatIO();
		acStlmntGlMBatIO.setInstCd(instCd);
		acStlmntGlMBatIO.setStlmntBaseDt(prcdTrmLastBizDt);
		acStlmntGlMBatIO.setStlmntNth(maxStlmntNth);
		
		return _getAcStlmntGlMBat().selectList(acStlmntGlMBatIO);
	}

	/**
	 * @return the dateCalculator
	 */
	private DateCalculator _getDateCalculator() {
		if (dateCalculator == null) {
			dateCalculator = (DateCalculator) CbbApplicationContext.getBean(
					DateCalculator.class, dateCalculator);
		}
		return dateCalculator;
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
	 * @return the acStlmntGlMBat
	 */
	private AcStlmntGlMBat _getAcStlmntGlMBat() {
		if (acStlmntGlMBat == null) {
			acStlmntGlMBat = (AcStlmntGlMBat) CbbApplicationContext.getBean(AcStlmntGlMBat.class, acStlmntGlMBat);
		}
		return acStlmntGlMBat;
	}
}