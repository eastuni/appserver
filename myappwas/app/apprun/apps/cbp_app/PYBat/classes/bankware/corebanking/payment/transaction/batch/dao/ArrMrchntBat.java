/**
 * DBIO 에디터에서 생성된 파일입니다. 인터페이스 파일을 직접 수정하지 마십시오.
 * @Generated Tue Apr 18 13:49:11 KST 2017
 */
package bankware.corebanking.payment.transaction.batch.dao;

import bxm.container.annotation.BxmDataAccess;
import bxm.common.annotaion.BxmCategory;
import org.apache.ibatis.annotations.Param;

@SuppressWarnings({ "all" })
@BxmDataAccess(mapper = "bankware/corebanking/payment/transaction/batch/dao/ArrMrchntBat.dbio", datasource = "CBB")
@BxmCategory(logicalName = "ArrMrchntBat", description = "ArrMrchntBat")
public interface ArrMrchntBat
{

	/**
	 * @TestValues 	instCd=101;	baseDt=20170417;
	 */
	@BxmCategory(description = "")
	java.util.List<bankware.corebanking.payment.transaction.batch.dto.ArrMrchntInfoIO> selectArrMrchntInfo(
			@Param("instCd") java.lang.String instCd,
			@Param("baseDt") java.lang.String baseDt);
}