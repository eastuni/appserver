package bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dso;


import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.cloud.batch.CbbAntUtil;
import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dao.ArArrPlnMBat;
import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dao.dto.ArArrPlnMIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.utility.interfaces.SysNonstopUtil;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;


@BxmBean
@BxmCategory(logicalName = "ArArrPlnMDdo.java", description = "계약계획조회분산DDO")
public class ArArrPlnMDdo {
	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private ArArrPlnMBat	arArrPlnMBat;
	private SysNonstopUtil 	sysNonstopUtil;
	private CmnContext 		cmnContext;




	/**
	 * @throws BizApplicationException 
	 * @TestValues 	instCd=;	arrArrRelCd=;	bizDscd=;	pdTpCd=;	pdTmpltCd=;	pdCd=;	lastChngTmstmp=;	lastChngGuid=;
	 */
	@BxmCategory(description = "")
	public List<ArArrPlnMIO> selectList(String instCd, String arrSrvcTpCd, String baseDt, String tableIndex){
		
		if(CbbApplicationContext.isDistributed()){
			CbbAntUtil.setJoinCondition("ar_arr_pln_m", new String[]{"ar_arr_m"}, tableIndex);
		}

		return _getArArrPlnMBat().selectList(instCd, arrSrvcTpCd, baseDt);
	}


	/**
	 * @return the sysNonstopUtil
	 */
	private SysNonstopUtil _getSysNonstopUtil() {
		if (sysNonstopUtil == null) {
			sysNonstopUtil = (SysNonstopUtil) CbbApplicationContext.getBean(
					SysNonstopUtil.class, sysNonstopUtil);
		}
		return sysNonstopUtil;
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
	 * @return the arArrPlnMBat
	 */
	private ArArrPlnMBat _getArArrPlnMBat() {
		if (arArrPlnMBat == null) {
			arArrPlnMBat = (ArArrPlnMBat) CbbApplicationContext.getBean(
					ArArrPlnMBat.class, arArrPlnMBat);
		}
		return arArrPlnMBat;
	}
}
