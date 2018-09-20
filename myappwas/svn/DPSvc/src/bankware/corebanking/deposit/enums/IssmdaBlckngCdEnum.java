package bankware.corebanking.deposit.enums;


import bankware.corebanking.arrangement.enums.ArrSrvcBlckngKndEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * This Enum class is used to classify blocking type of issued media
 *
 * Author	Jungyeon Lee
 * History
 *  2017.07.07	initial version for 2.2
 */
@BxmCategory(logicalName = "Issued media blocking code" )
@CbbClassInfo(classType={"ENUM"})
public enum IssmdaBlckngCdEnum implements IEnum {


	CASH_CARD_WHDRWL_SPNSN         	("001", ArrSrvcBlckngKndEnum.CHECK_CARD_CASH_WITHDRAWAL_TRANSACTION_BLOCKING.getValue()),    // 현금카드 출금정지
	CASH_CARD_LOST                 	("002", ArrSrvcBlckngKndEnum.CARD_LOSS.getValue()),    // 현금카드 분실
	CHECK_CARD_RETURN              	("003", ""),    // 체크카드 반송
	CHECK_CARD_LOST            		("004", ArrSrvcBlckngKndEnum.CARD_LOSS.getValue()),    // 체크카드 분실
	PASSBOOK_LOST					("005", ArrSrvcBlckngKndEnum.PASS_BOOK_LOSS.getValue()),	// 통장 분실
	SEAL_LOST 						("006", ArrSrvcBlckngKndEnum.SEAL_LOSS.getValue()),	// 인감 분실
	CHECK_CARD_STOLEN               ("007", ""),    //체크카드 도난 
	MEMBER_REQUEST                  ("008", ""),    //회원요청
	;


	private String value;
	private String arrSrvcBlckngKnd;




	IssmdaBlckngCdEnum(String value , String arrSrvcBlckngKnd) { 
    	this.value = value;
    	this.arrSrvcBlckngKnd = arrSrvcBlckngKnd;

    }
	
	


    public String getValue() {
		return value;
	}
    
    public String getArrSrvcBlckngKnd() {
		return arrSrvcBlckngKnd;
	}


    public static IssmdaBlckngCdEnum getEnum (String value){
        for (IssmdaBlckngCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }
    
    
    public static IssmdaBlckngCdEnum getEnumBySrvcBlckngCd (String value){
        for (IssmdaBlckngCdEnum enumObject: values()){
          if(enumObject.getArrSrvcBlckngKnd().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (IssmdaBlckngCdEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


