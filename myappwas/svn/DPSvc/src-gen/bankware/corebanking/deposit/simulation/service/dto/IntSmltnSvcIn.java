/******************************************************************************
 * Bxm Object Message Mapping(OMM) - Source Generator V6-1
 *
 * 생성된 자바파일은 수정하지 마십시오.
 * OMM 파일 수정시 Java파일을 덮어쓰게 됩니다.
 *
 ******************************************************************************/

package bankware.corebanking.deposit.simulation.service.dto;


import bxm.omm.annotation.BxmOmm_Field;
import bxm.omm.predict.Predictable;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Hashtable;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlRootElement;
import bxm.omm.root.IOmmObject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import bxm.omm.predict.FieldInfo;

/**
 * @Description 
 */
@XmlType(propOrder={"intTxTpCd", "acctNbr", "baseDt", "arrTrmntnDscd", "prtlWhdrwlAmt"}, name="IntSmltnSvcIn")
@XmlRootElement(name="IntSmltnSvcIn")
@SuppressWarnings("all")
public class IntSmltnSvcIn  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = 298397893L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << intTxTpCd >> [[ */
	
	@XmlTransient
	private boolean isSet_intTxTpCd = false;
	
	protected boolean isSet_intTxTpCd()
	{
		return this.isSet_intTxTpCd;
	}
	
	protected void setIsSet_intTxTpCd(boolean value)
	{
		this.isSet_intTxTpCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="이자거래유형코드", formatType="", format="", align="left", length=2, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String intTxTpCd  = null;
	
	/**
	 * @Description 이자거래유형코드
	 */
	public java.lang.String getIntTxTpCd(){
		return intTxTpCd;
	}
	
	/**
	 * @Description 이자거래유형코드
	 */
	@JsonProperty("intTxTpCd")
	public void setIntTxTpCd( java.lang.String intTxTpCd ) {
		isSet_intTxTpCd = true;
		this.intTxTpCd = intTxTpCd;
	}
	
	/** Property set << intTxTpCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << acctNbr >> [[ */
	
	@XmlTransient
	private boolean isSet_acctNbr = false;
	
	protected boolean isSet_acctNbr()
	{
		return this.isSet_acctNbr;
	}
	
	protected void setIsSet_acctNbr(boolean value)
	{
		this.isSet_acctNbr = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계좌번호", formatType="", format="", align="left", length=15, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String acctNbr  = null;
	
	/**
	 * @Description 계좌번호
	 */
	public java.lang.String getAcctNbr(){
		return acctNbr;
	}
	
	/**
	 * @Description 계좌번호
	 */
	@JsonProperty("acctNbr")
	public void setAcctNbr( java.lang.String acctNbr ) {
		isSet_acctNbr = true;
		this.acctNbr = acctNbr;
	}
	
	/** Property set << acctNbr >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << baseDt >> [[ */
	
	@XmlTransient
	private boolean isSet_baseDt = false;
	
	protected boolean isSet_baseDt()
	{
		return this.isSet_baseDt;
	}
	
	protected void setIsSet_baseDt(boolean value)
	{
		this.isSet_baseDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="기준일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String baseDt  = null;
	
	/**
	 * @Description 기준일
	 */
	public java.lang.String getBaseDt(){
		return baseDt;
	}
	
	/**
	 * @Description 기준일
	 */
	@JsonProperty("baseDt")
	public void setBaseDt( java.lang.String baseDt ) {
		isSet_baseDt = true;
		this.baseDt = baseDt;
	}
	
	/** Property set << baseDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrTrmntnDscd >> [[ */
	
	@XmlTransient
	private boolean isSet_arrTrmntnDscd = false;
	
	protected boolean isSet_arrTrmntnDscd()
	{
		return this.isSet_arrTrmntnDscd;
	}
	
	protected void setIsSet_arrTrmntnDscd(boolean value)
	{
		this.isSet_arrTrmntnDscd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약해지구분", formatType="", format="", align="left", length=2, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrTrmntnDscd  = null;
	
	/**
	 * @Description 계약해지구분
	 */
	public java.lang.String getArrTrmntnDscd(){
		return arrTrmntnDscd;
	}
	
	/**
	 * @Description 계약해지구분
	 */
	@JsonProperty("arrTrmntnDscd")
	public void setArrTrmntnDscd( java.lang.String arrTrmntnDscd ) {
		isSet_arrTrmntnDscd = true;
		this.arrTrmntnDscd = arrTrmntnDscd;
	}
	
	/** Property set << arrTrmntnDscd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << prtlWhdrwlAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_prtlWhdrwlAmt = false;
	
	protected boolean isSet_prtlWhdrwlAmt()
	{
		return this.isSet_prtlWhdrwlAmt;
	}
	
	protected void setIsSet_prtlWhdrwlAmt(boolean value)
	{
		this.isSet_prtlWhdrwlAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 일부출금금액
	 */
	public void setPrtlWhdrwlAmt(java.lang.String value) {
		isSet_prtlWhdrwlAmt = true;
		this.prtlWhdrwlAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 일부출금금액
	 */
	public void setPrtlWhdrwlAmt(double value) {
		isSet_prtlWhdrwlAmt = true;
		this.prtlWhdrwlAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 일부출금금액
	 */
	public void setPrtlWhdrwlAmt(long value) {
		isSet_prtlWhdrwlAmt = true;
		this.prtlWhdrwlAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="일부출금금액", formatType="", format="", align="right", length=15, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal prtlWhdrwlAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 일부출금금액
	 */
	public java.math.BigDecimal getPrtlWhdrwlAmt(){
		return prtlWhdrwlAmt;
	}
	
	/**
	 * @Description 일부출금금액
	 */
	@JsonProperty("prtlWhdrwlAmt")
	public void setPrtlWhdrwlAmt( java.math.BigDecimal prtlWhdrwlAmt ) {
		isSet_prtlWhdrwlAmt = true;
		this.prtlWhdrwlAmt = prtlWhdrwlAmt;
	}
	
	/** Property set << prtlWhdrwlAmt >> ]]
	*******************************************************************************************************************************/

	@Override
	public IntSmltnSvcIn clone(){
		try{
			IntSmltnSvcIn object= (IntSmltnSvcIn)super.clone();
			if ( this.intTxTpCd== null ) object.intTxTpCd = null;
			else{
				object.intTxTpCd = this.intTxTpCd;
			}
			if ( this.acctNbr== null ) object.acctNbr = null;
			else{
				object.acctNbr = this.acctNbr;
			}
			if ( this.baseDt== null ) object.baseDt = null;
			else{
				object.baseDt = this.baseDt;
			}
			if ( this.arrTrmntnDscd== null ) object.arrTrmntnDscd = null;
			else{
				object.arrTrmntnDscd = this.arrTrmntnDscd;
			}
			if ( this.prtlWhdrwlAmt== null ) object.prtlWhdrwlAmt = null;
			else{
				object.prtlWhdrwlAmt = new java.math.BigDecimal(prtlWhdrwlAmt.toString());
			}
			
			return object;
		} 
		catch(Exception e){
			throw new bxm.omm.exception.CloneFailedException(e);
		}
	}

	
	@Override
	public int hashCode(){
		final int prime=31;
		int result = 1;
		result = prime * result + ((intTxTpCd==null)?0:intTxTpCd.hashCode());
		result = prime * result + ((acctNbr==null)?0:acctNbr.hashCode());
		result = prime * result + ((baseDt==null)?0:baseDt.hashCode());
		result = prime * result + ((arrTrmntnDscd==null)?0:arrTrmntnDscd.hashCode());
		result = prime * result + ((prtlWhdrwlAmt==null)?0:prtlWhdrwlAmt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcIn other = (bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcIn)obj;
		if ( intTxTpCd == null ){
			if ( other.intTxTpCd != null ) return false;
		}
		else if ( !intTxTpCd.equals(other.intTxTpCd) )
			return false;
		if ( acctNbr == null ){
			if ( other.acctNbr != null ) return false;
		}
		else if ( !acctNbr.equals(other.acctNbr) )
			return false;
		if ( baseDt == null ){
			if ( other.baseDt != null ) return false;
		}
		else if ( !baseDt.equals(other.baseDt) )
			return false;
		if ( arrTrmntnDscd == null ){
			if ( other.arrTrmntnDscd != null ) return false;
		}
		else if ( !arrTrmntnDscd.equals(other.arrTrmntnDscd) )
			return false;
		if ( prtlWhdrwlAmt == null ){
			if ( other.prtlWhdrwlAmt != null ) return false;
		}
		else if ( !prtlWhdrwlAmt.equals(other.prtlWhdrwlAmt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcIn:\n");
		sb.append("\tintTxTpCd: ");
		sb.append(intTxTpCd==null?"null":getIntTxTpCd());
		sb.append("\n");
		sb.append("\tacctNbr: ");
		sb.append(acctNbr==null?"null":getAcctNbr());
		sb.append("\n");
		sb.append("\tbaseDt: ");
		sb.append(baseDt==null?"null":getBaseDt());
		sb.append("\n");
		sb.append("\tarrTrmntnDscd: ");
		sb.append(arrTrmntnDscd==null?"null":getArrTrmntnDscd());
		sb.append("\n");
		sb.append("\tprtlWhdrwlAmt: ");
		sb.append(prtlWhdrwlAmt==null?"null":getPrtlWhdrwlAmt());
		sb.append("\n");
		sb.append("]\n");
	
		return sb.toString();
	}

	/**
	 * Only for Fixed-Length Data
	 */
	@Override
	public long predictMessageLength(){
		long messageLen= 0;
	
		messageLen+= 2; /* intTxTpCd */
		messageLen+= 15; /* acctNbr */
		messageLen+= 8; /* baseDt */
		messageLen+= 2; /* arrTrmntnDscd */
		messageLen+= 15; /* prtlWhdrwlAmt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("intTxTpCd");
	
		fieldNames.add("acctNbr");
	
		fieldNames.add("baseDt");
	
		fieldNames.add("arrTrmntnDscd");
	
		fieldNames.add("prtlWhdrwlAmt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("intTxTpCd", get("intTxTpCd"));
	
		fieldValueMap.put("acctNbr", get("acctNbr"));
	
		fieldValueMap.put("baseDt", get("baseDt"));
	
		fieldValueMap.put("arrTrmntnDscd", get("arrTrmntnDscd"));
	
		fieldValueMap.put("prtlWhdrwlAmt", get("prtlWhdrwlAmt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case 20946288 : /* intTxTpCd */
			return getIntTxTpCd();
		case -1177207765 : /* acctNbr */
			return getAcctNbr();
		case -1396203711 : /* baseDt */
			return getBaseDt();
		case 186235242 : /* arrTrmntnDscd */
			return getArrTrmntnDscd();
		case 1459473434 : /* prtlWhdrwlAmt */
			return getPrtlWhdrwlAmt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case 20946288 : /* intTxTpCd */
			setIntTxTpCd((java.lang.String) value);
			return;
		case -1177207765 : /* acctNbr */
			setAcctNbr((java.lang.String) value);
			return;
		case -1396203711 : /* baseDt */
			setBaseDt((java.lang.String) value);
			return;
		case 186235242 : /* arrTrmntnDscd */
			setArrTrmntnDscd((java.lang.String) value);
			return;
		case 1459473434 : /* prtlWhdrwlAmt */
			setPrtlWhdrwlAmt((java.math.BigDecimal) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
