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
@XmlType(propOrder={"arrOpnDt", "arrMtrtyDt", "intCalcnStartDt", "intCalcnEndDt", "acctBal", "intAmt", "tax", "rvrsdIntAmt", "rvrsdTax", "stlmntList", "custId", "custNm", "crncyCd", "pdNm", "arrStsCd", "mgmtDeptId", "mgmtDeptNm"}, name="IntSmltnSvcOut")
@XmlRootElement(name="IntSmltnSvcOut")
@SuppressWarnings("all")
public class IntSmltnSvcOut  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = 660406190L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << arrOpnDt >> [[ */
	
	@XmlTransient
	private boolean isSet_arrOpnDt = false;
	
	protected boolean isSet_arrOpnDt()
	{
		return this.isSet_arrOpnDt;
	}
	
	protected void setIsSet_arrOpnDt(boolean value)
	{
		this.isSet_arrOpnDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약개설일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrOpnDt  = null;
	
	/**
	 * @Description 계약개설일
	 */
	public java.lang.String getArrOpnDt(){
		return arrOpnDt;
	}
	
	/**
	 * @Description 계약개설일
	 */
	@JsonProperty("arrOpnDt")
	public void setArrOpnDt( java.lang.String arrOpnDt ) {
		isSet_arrOpnDt = true;
		this.arrOpnDt = arrOpnDt;
	}
	
	/** Property set << arrOpnDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrMtrtyDt >> [[ */
	
	@XmlTransient
	private boolean isSet_arrMtrtyDt = false;
	
	protected boolean isSet_arrMtrtyDt()
	{
		return this.isSet_arrMtrtyDt;
	}
	
	protected void setIsSet_arrMtrtyDt(boolean value)
	{
		this.isSet_arrMtrtyDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약만기일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrMtrtyDt  = null;
	
	/**
	 * @Description 계약만기일
	 */
	public java.lang.String getArrMtrtyDt(){
		return arrMtrtyDt;
	}
	
	/**
	 * @Description 계약만기일
	 */
	@JsonProperty("arrMtrtyDt")
	public void setArrMtrtyDt( java.lang.String arrMtrtyDt ) {
		isSet_arrMtrtyDt = true;
		this.arrMtrtyDt = arrMtrtyDt;
	}
	
	/** Property set << arrMtrtyDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << intCalcnStartDt >> [[ */
	
	@XmlTransient
	private boolean isSet_intCalcnStartDt = false;
	
	protected boolean isSet_intCalcnStartDt()
	{
		return this.isSet_intCalcnStartDt;
	}
	
	protected void setIsSet_intCalcnStartDt(boolean value)
	{
		this.isSet_intCalcnStartDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="이자계산시작년월일", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String intCalcnStartDt  = null;
	
	/**
	 * @Description 이자계산시작년월일
	 */
	public java.lang.String getIntCalcnStartDt(){
		return intCalcnStartDt;
	}
	
	/**
	 * @Description 이자계산시작년월일
	 */
	@JsonProperty("intCalcnStartDt")
	public void setIntCalcnStartDt( java.lang.String intCalcnStartDt ) {
		isSet_intCalcnStartDt = true;
		this.intCalcnStartDt = intCalcnStartDt;
	}
	
	/** Property set << intCalcnStartDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << intCalcnEndDt >> [[ */
	
	@XmlTransient
	private boolean isSet_intCalcnEndDt = false;
	
	protected boolean isSet_intCalcnEndDt()
	{
		return this.isSet_intCalcnEndDt;
	}
	
	protected void setIsSet_intCalcnEndDt(boolean value)
	{
		this.isSet_intCalcnEndDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="이자계산종료년월일", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String intCalcnEndDt  = null;
	
	/**
	 * @Description 이자계산종료년월일
	 */
	public java.lang.String getIntCalcnEndDt(){
		return intCalcnEndDt;
	}
	
	/**
	 * @Description 이자계산종료년월일
	 */
	@JsonProperty("intCalcnEndDt")
	public void setIntCalcnEndDt( java.lang.String intCalcnEndDt ) {
		isSet_intCalcnEndDt = true;
		this.intCalcnEndDt = intCalcnEndDt;
	}
	
	/** Property set << intCalcnEndDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << acctBal >> [[ */
	
	@XmlTransient
	private boolean isSet_acctBal = false;
	
	protected boolean isSet_acctBal()
	{
		return this.isSet_acctBal;
	}
	
	protected void setIsSet_acctBal(boolean value)
	{
		this.isSet_acctBal = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 계좌잔액
	 */
	public void setAcctBal(java.lang.String value) {
		isSet_acctBal = true;
		this.acctBal = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 계좌잔액
	 */
	public void setAcctBal(double value) {
		isSet_acctBal = true;
		this.acctBal = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 계좌잔액
	 */
	public void setAcctBal(long value) {
		isSet_acctBal = true;
		this.acctBal = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="계좌잔액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal acctBal  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 계좌잔액
	 */
	public java.math.BigDecimal getAcctBal(){
		return acctBal;
	}
	
	/**
	 * @Description 계좌잔액
	 */
	@JsonProperty("acctBal")
	public void setAcctBal( java.math.BigDecimal acctBal ) {
		isSet_acctBal = true;
		this.acctBal = acctBal;
	}
	
	/** Property set << acctBal >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << intAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_intAmt = false;
	
	protected boolean isSet_intAmt()
	{
		return this.isSet_intAmt;
	}
	
	protected void setIsSet_intAmt(boolean value)
	{
		this.isSet_intAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 이자금액
	 */
	public void setIntAmt(java.lang.String value) {
		isSet_intAmt = true;
		this.intAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 이자금액
	 */
	public void setIntAmt(double value) {
		isSet_intAmt = true;
		this.intAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 이자금액
	 */
	public void setIntAmt(long value) {
		isSet_intAmt = true;
		this.intAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="이자금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal intAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 이자금액
	 */
	public java.math.BigDecimal getIntAmt(){
		return intAmt;
	}
	
	/**
	 * @Description 이자금액
	 */
	@JsonProperty("intAmt")
	public void setIntAmt( java.math.BigDecimal intAmt ) {
		isSet_intAmt = true;
		this.intAmt = intAmt;
	}
	
	/** Property set << intAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << tax >> [[ */
	
	@XmlTransient
	private boolean isSet_tax = false;
	
	protected boolean isSet_tax()
	{
		return this.isSet_tax;
	}
	
	protected void setIsSet_tax(boolean value)
	{
		this.isSet_tax = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 세금금액
	 */
	public void setTax(java.lang.String value) {
		isSet_tax = true;
		this.tax = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 세금금액
	 */
	public void setTax(double value) {
		isSet_tax = true;
		this.tax = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 세금금액
	 */
	public void setTax(long value) {
		isSet_tax = true;
		this.tax = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="세금금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal tax  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 세금금액
	 */
	public java.math.BigDecimal getTax(){
		return tax;
	}
	
	/**
	 * @Description 세금금액
	 */
	@JsonProperty("tax")
	public void setTax( java.math.BigDecimal tax ) {
		isSet_tax = true;
		this.tax = tax;
	}
	
	/** Property set << tax >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << rvrsdIntAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_rvrsdIntAmt = false;
	
	protected boolean isSet_rvrsdIntAmt()
	{
		return this.isSet_rvrsdIntAmt;
	}
	
	protected void setIsSet_rvrsdIntAmt(boolean value)
	{
		this.isSet_rvrsdIntAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 환출이자금액
	 */
	public void setRvrsdIntAmt(java.lang.String value) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 환출이자금액
	 */
	public void setRvrsdIntAmt(double value) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 환출이자금액
	 */
	public void setRvrsdIntAmt(long value) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="환출이자금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal rvrsdIntAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 환출이자금액
	 */
	public java.math.BigDecimal getRvrsdIntAmt(){
		return rvrsdIntAmt;
	}
	
	/**
	 * @Description 환출이자금액
	 */
	@JsonProperty("rvrsdIntAmt")
	public void setRvrsdIntAmt( java.math.BigDecimal rvrsdIntAmt ) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = rvrsdIntAmt;
	}
	
	/** Property set << rvrsdIntAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << rvrsdTax >> [[ */
	
	@XmlTransient
	private boolean isSet_rvrsdTax = false;
	
	protected boolean isSet_rvrsdTax()
	{
		return this.isSet_rvrsdTax;
	}
	
	protected void setIsSet_rvrsdTax(boolean value)
	{
		this.isSet_rvrsdTax = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 환입세금금액
	 */
	public void setRvrsdTax(java.lang.String value) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 환입세금금액
	 */
	public void setRvrsdTax(double value) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 환입세금금액
	 */
	public void setRvrsdTax(long value) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="환입세금금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal rvrsdTax  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 환입세금금액
	 */
	public java.math.BigDecimal getRvrsdTax(){
		return rvrsdTax;
	}
	
	/**
	 * @Description 환입세금금액
	 */
	@JsonProperty("rvrsdTax")
	public void setRvrsdTax( java.math.BigDecimal rvrsdTax ) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = rvrsdTax;
	}
	
	/** Property set << rvrsdTax >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << stlmntList >> [[ */
	
	@XmlTransient
	private boolean isSet_stlmntList = false;
	
	protected boolean isSet_stlmntList()
	{
		return this.isSet_stlmntList;
	}
	
	protected void setIsSet_stlmntList(boolean value)
	{
		this.isSet_stlmntList = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="정산내역", formatType="", format="", align="left", length=0, decimal=0, arrayReference="500", fill="", comment="", validationRule="")
	private java.util.List<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub> stlmntList  = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub>();
	
	/**
	 * @Description 정산내역
	 */
	public java.util.List<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub>  getStlmntList(){
		return stlmntList;
	}
	
	/**
	 * @Description 정산내역
	 */
	@JsonProperty("stlmntList")
	public void setStlmntList( java.util.List<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub> stlmntList ) {
		isSet_stlmntList = true;
		this.stlmntList = stlmntList;
	}
	
	/** Property set << stlmntList >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << custId >> [[ */
	
	@XmlTransient
	private boolean isSet_custId = false;
	
	protected boolean isSet_custId()
	{
		return this.isSet_custId;
	}
	
	protected void setIsSet_custId(boolean value)
	{
		this.isSet_custId = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="고객식별자", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String custId  = null;
	
	/**
	 * @Description 고객식별자
	 */
	public java.lang.String getCustId(){
		return custId;
	}
	
	/**
	 * @Description 고객식별자
	 */
	@JsonProperty("custId")
	public void setCustId( java.lang.String custId ) {
		isSet_custId = true;
		this.custId = custId;
	}
	
	/** Property set << custId >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << custNm >> [[ */
	
	@XmlTransient
	private boolean isSet_custNm = false;
	
	protected boolean isSet_custNm()
	{
		return this.isSet_custNm;
	}
	
	protected void setIsSet_custNm(boolean value)
	{
		this.isSet_custNm = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="고객명", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String custNm  = null;
	
	/**
	 * @Description 고객명
	 */
	public java.lang.String getCustNm(){
		return custNm;
	}
	
	/**
	 * @Description 고객명
	 */
	@JsonProperty("custNm")
	public void setCustNm( java.lang.String custNm ) {
		isSet_custNm = true;
		this.custNm = custNm;
	}
	
	/** Property set << custNm >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << crncyCd >> [[ */
	
	@XmlTransient
	private boolean isSet_crncyCd = false;
	
	protected boolean isSet_crncyCd()
	{
		return this.isSet_crncyCd;
	}
	
	protected void setIsSet_crncyCd(boolean value)
	{
		this.isSet_crncyCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="통화코드", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String crncyCd  = null;
	
	/**
	 * @Description 통화코드
	 */
	public java.lang.String getCrncyCd(){
		return crncyCd;
	}
	
	/**
	 * @Description 통화코드
	 */
	@JsonProperty("crncyCd")
	public void setCrncyCd( java.lang.String crncyCd ) {
		isSet_crncyCd = true;
		this.crncyCd = crncyCd;
	}
	
	/** Property set << crncyCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << pdNm >> [[ */
	
	@XmlTransient
	private boolean isSet_pdNm = false;
	
	protected boolean isSet_pdNm()
	{
		return this.isSet_pdNm;
	}
	
	protected void setIsSet_pdNm(boolean value)
	{
		this.isSet_pdNm = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="상품명", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String pdNm  = null;
	
	/**
	 * @Description 상품명
	 */
	public java.lang.String getPdNm(){
		return pdNm;
	}
	
	/**
	 * @Description 상품명
	 */
	@JsonProperty("pdNm")
	public void setPdNm( java.lang.String pdNm ) {
		isSet_pdNm = true;
		this.pdNm = pdNm;
	}
	
	/** Property set << pdNm >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrStsCd >> [[ */
	
	@XmlTransient
	private boolean isSet_arrStsCd = false;
	
	protected boolean isSet_arrStsCd()
	{
		return this.isSet_arrStsCd;
	}
	
	protected void setIsSet_arrStsCd(boolean value)
	{
		this.isSet_arrStsCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약상태코드", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrStsCd  = null;
	
	/**
	 * @Description 계약상태코드
	 */
	public java.lang.String getArrStsCd(){
		return arrStsCd;
	}
	
	/**
	 * @Description 계약상태코드
	 */
	@JsonProperty("arrStsCd")
	public void setArrStsCd( java.lang.String arrStsCd ) {
		isSet_arrStsCd = true;
		this.arrStsCd = arrStsCd;
	}
	
	/** Property set << arrStsCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << mgmtDeptId >> [[ */
	
	@XmlTransient
	private boolean isSet_mgmtDeptId = false;
	
	protected boolean isSet_mgmtDeptId()
	{
		return this.isSet_mgmtDeptId;
	}
	
	protected void setIsSet_mgmtDeptId(boolean value)
	{
		this.isSet_mgmtDeptId = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="관리부서식별자", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String mgmtDeptId  = null;
	
	/**
	 * @Description 관리부서식별자
	 */
	public java.lang.String getMgmtDeptId(){
		return mgmtDeptId;
	}
	
	/**
	 * @Description 관리부서식별자
	 */
	@JsonProperty("mgmtDeptId")
	public void setMgmtDeptId( java.lang.String mgmtDeptId ) {
		isSet_mgmtDeptId = true;
		this.mgmtDeptId = mgmtDeptId;
	}
	
	/** Property set << mgmtDeptId >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << mgmtDeptNm >> [[ */
	
	@XmlTransient
	private boolean isSet_mgmtDeptNm = false;
	
	protected boolean isSet_mgmtDeptNm()
	{
		return this.isSet_mgmtDeptNm;
	}
	
	protected void setIsSet_mgmtDeptNm(boolean value)
	{
		this.isSet_mgmtDeptNm = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="관리부서명", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String mgmtDeptNm  = null;
	
	/**
	 * @Description 관리부서명
	 */
	public java.lang.String getMgmtDeptNm(){
		return mgmtDeptNm;
	}
	
	/**
	 * @Description 관리부서명
	 */
	@JsonProperty("mgmtDeptNm")
	public void setMgmtDeptNm( java.lang.String mgmtDeptNm ) {
		isSet_mgmtDeptNm = true;
		this.mgmtDeptNm = mgmtDeptNm;
	}
	
	/** Property set << mgmtDeptNm >> ]]
	*******************************************************************************************************************************/

	@Override
	public IntSmltnSvcOut clone(){
		try{
			IntSmltnSvcOut object= (IntSmltnSvcOut)super.clone();
			if ( this.arrOpnDt== null ) object.arrOpnDt = null;
			else{
				object.arrOpnDt = this.arrOpnDt;
			}
			if ( this.arrMtrtyDt== null ) object.arrMtrtyDt = null;
			else{
				object.arrMtrtyDt = this.arrMtrtyDt;
			}
			if ( this.intCalcnStartDt== null ) object.intCalcnStartDt = null;
			else{
				object.intCalcnStartDt = this.intCalcnStartDt;
			}
			if ( this.intCalcnEndDt== null ) object.intCalcnEndDt = null;
			else{
				object.intCalcnEndDt = this.intCalcnEndDt;
			}
			if ( this.acctBal== null ) object.acctBal = null;
			else{
				object.acctBal = new java.math.BigDecimal(acctBal.toString());
			}
			if ( this.intAmt== null ) object.intAmt = null;
			else{
				object.intAmt = new java.math.BigDecimal(intAmt.toString());
			}
			if ( this.tax== null ) object.tax = null;
			else{
				object.tax = new java.math.BigDecimal(tax.toString());
			}
			if ( this.rvrsdIntAmt== null ) object.rvrsdIntAmt = null;
			else{
				object.rvrsdIntAmt = new java.math.BigDecimal(rvrsdIntAmt.toString());
			}
			if ( this.rvrsdTax== null ) object.rvrsdTax = null;
			else{
				object.rvrsdTax = new java.math.BigDecimal(rvrsdTax.toString());
			}
			if ( this.stlmntList== null ) object.stlmntList = null;
			else{
				java.util.List<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub> clonedList = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub>(stlmntList.size());
				for( bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub item : stlmntList ){
					clonedList.add( (bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub)item.clone());
				}
				object.stlmntList = clonedList;
			}
			if ( this.custId== null ) object.custId = null;
			else{
				object.custId = this.custId;
			}
			if ( this.custNm== null ) object.custNm = null;
			else{
				object.custNm = this.custNm;
			}
			if ( this.crncyCd== null ) object.crncyCd = null;
			else{
				object.crncyCd = this.crncyCd;
			}
			if ( this.pdNm== null ) object.pdNm = null;
			else{
				object.pdNm = this.pdNm;
			}
			if ( this.arrStsCd== null ) object.arrStsCd = null;
			else{
				object.arrStsCd = this.arrStsCd;
			}
			if ( this.mgmtDeptId== null ) object.mgmtDeptId = null;
			else{
				object.mgmtDeptId = this.mgmtDeptId;
			}
			if ( this.mgmtDeptNm== null ) object.mgmtDeptNm = null;
			else{
				object.mgmtDeptNm = this.mgmtDeptNm;
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
		result = prime * result + ((arrOpnDt==null)?0:arrOpnDt.hashCode());
		result = prime * result + ((arrMtrtyDt==null)?0:arrMtrtyDt.hashCode());
		result = prime * result + ((intCalcnStartDt==null)?0:intCalcnStartDt.hashCode());
		result = prime * result + ((intCalcnEndDt==null)?0:intCalcnEndDt.hashCode());
		result = prime * result + ((acctBal==null)?0:acctBal.hashCode());
		result = prime * result + ((intAmt==null)?0:intAmt.hashCode());
		result = prime * result + ((tax==null)?0:tax.hashCode());
		result = prime * result + ((rvrsdIntAmt==null)?0:rvrsdIntAmt.hashCode());
		result = prime * result + ((rvrsdTax==null)?0:rvrsdTax.hashCode());
		result = prime * result + ((stlmntList==null)?0:stlmntList.hashCode());
		result = prime * result + ((custId==null)?0:custId.hashCode());
		result = prime * result + ((custNm==null)?0:custNm.hashCode());
		result = prime * result + ((crncyCd==null)?0:crncyCd.hashCode());
		result = prime * result + ((pdNm==null)?0:pdNm.hashCode());
		result = prime * result + ((arrStsCd==null)?0:arrStsCd.hashCode());
		result = prime * result + ((mgmtDeptId==null)?0:mgmtDeptId.hashCode());
		result = prime * result + ((mgmtDeptNm==null)?0:mgmtDeptNm.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOut other = (bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOut)obj;
		if ( arrOpnDt == null ){
			if ( other.arrOpnDt != null ) return false;
		}
		else if ( !arrOpnDt.equals(other.arrOpnDt) )
			return false;
		if ( arrMtrtyDt == null ){
			if ( other.arrMtrtyDt != null ) return false;
		}
		else if ( !arrMtrtyDt.equals(other.arrMtrtyDt) )
			return false;
		if ( intCalcnStartDt == null ){
			if ( other.intCalcnStartDt != null ) return false;
		}
		else if ( !intCalcnStartDt.equals(other.intCalcnStartDt) )
			return false;
		if ( intCalcnEndDt == null ){
			if ( other.intCalcnEndDt != null ) return false;
		}
		else if ( !intCalcnEndDt.equals(other.intCalcnEndDt) )
			return false;
		if ( acctBal == null ){
			if ( other.acctBal != null ) return false;
		}
		else if ( !acctBal.equals(other.acctBal) )
			return false;
		if ( intAmt == null ){
			if ( other.intAmt != null ) return false;
		}
		else if ( !intAmt.equals(other.intAmt) )
			return false;
		if ( tax == null ){
			if ( other.tax != null ) return false;
		}
		else if ( !tax.equals(other.tax) )
			return false;
		if ( rvrsdIntAmt == null ){
			if ( other.rvrsdIntAmt != null ) return false;
		}
		else if ( !rvrsdIntAmt.equals(other.rvrsdIntAmt) )
			return false;
		if ( rvrsdTax == null ){
			if ( other.rvrsdTax != null ) return false;
		}
		else if ( !rvrsdTax.equals(other.rvrsdTax) )
			return false;
		if ( stlmntList == null ){
			if ( other.stlmntList != null ) return false;
		}
		else if ( !stlmntList.equals(other.stlmntList) )
			return false;
		if ( custId == null ){
			if ( other.custId != null ) return false;
		}
		else if ( !custId.equals(other.custId) )
			return false;
		if ( custNm == null ){
			if ( other.custNm != null ) return false;
		}
		else if ( !custNm.equals(other.custNm) )
			return false;
		if ( crncyCd == null ){
			if ( other.crncyCd != null ) return false;
		}
		else if ( !crncyCd.equals(other.crncyCd) )
			return false;
		if ( pdNm == null ){
			if ( other.pdNm != null ) return false;
		}
		else if ( !pdNm.equals(other.pdNm) )
			return false;
		if ( arrStsCd == null ){
			if ( other.arrStsCd != null ) return false;
		}
		else if ( !arrStsCd.equals(other.arrStsCd) )
			return false;
		if ( mgmtDeptId == null ){
			if ( other.mgmtDeptId != null ) return false;
		}
		else if ( !mgmtDeptId.equals(other.mgmtDeptId) )
			return false;
		if ( mgmtDeptNm == null ){
			if ( other.mgmtDeptNm != null ) return false;
		}
		else if ( !mgmtDeptNm.equals(other.mgmtDeptNm) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOut:\n");
		sb.append("\tarrOpnDt: ");
		sb.append(arrOpnDt==null?"null":getArrOpnDt());
		sb.append("\n");
		sb.append("\tarrMtrtyDt: ");
		sb.append(arrMtrtyDt==null?"null":getArrMtrtyDt());
		sb.append("\n");
		sb.append("\tintCalcnStartDt: ");
		sb.append(intCalcnStartDt==null?"null":getIntCalcnStartDt());
		sb.append("\n");
		sb.append("\tintCalcnEndDt: ");
		sb.append(intCalcnEndDt==null?"null":getIntCalcnEndDt());
		sb.append("\n");
		sb.append("\tacctBal: ");
		sb.append(acctBal==null?"null":getAcctBal());
		sb.append("\n");
		sb.append("\tintAmt: ");
		sb.append(intAmt==null?"null":getIntAmt());
		sb.append("\n");
		sb.append("\ttax: ");
		sb.append(tax==null?"null":getTax());
		sb.append("\n");
		sb.append("\trvrsdIntAmt: ");
		sb.append(rvrsdIntAmt==null?"null":getRvrsdIntAmt());
		sb.append("\n");
		sb.append("\trvrsdTax: ");
		sb.append(rvrsdTax==null?"null":getRvrsdTax());
		sb.append("\n");
		sb.append("\tstlmntList: ");
		if ( stlmntList == null ) sb.append("null");
		else{
			sb.append("array count : ");
			sb.append(stlmntList.size());
			sb.append("(items)\n");
	
			int max= (10<stlmntList.size())?10:stlmntList.size();
	
			for ( int i = 0; i < max; ++i ){
				sb.append("\tstlmntList[");
				sb.append(i);
				sb.append("] : ");
				sb.append(stlmntList.get(i));
				sb.append("\n");
			}
	
			if ( max < stlmntList.size() ){
				sb.append("\tstlmntList[.] : ").append("more ").append((stlmntList.size()-max)).append(" items").append("\n");
			}
		}
		sb.append("\tcustId: ");
		sb.append(custId==null?"null":getCustId());
		sb.append("\n");
		sb.append("\tcustNm: ");
		sb.append(custNm==null?"null":getCustNm());
		sb.append("\n");
		sb.append("\tcrncyCd: ");
		sb.append(crncyCd==null?"null":getCrncyCd());
		sb.append("\n");
		sb.append("\tpdNm: ");
		sb.append(pdNm==null?"null":getPdNm());
		sb.append("\n");
		sb.append("\tarrStsCd: ");
		sb.append(arrStsCd==null?"null":getArrStsCd());
		sb.append("\n");
		sb.append("\tmgmtDeptId: ");
		sb.append(mgmtDeptId==null?"null":getMgmtDeptId());
		sb.append("\n");
		sb.append("\tmgmtDeptNm: ");
		sb.append(mgmtDeptNm==null?"null":getMgmtDeptNm());
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
	
		messageLen+= 8; /* arrOpnDt */
		messageLen+= 8; /* arrMtrtyDt */
		messageLen+= 20; /* intCalcnStartDt */
		messageLen+= 20; /* intCalcnEndDt */
		messageLen+= 17; /* acctBal */
		messageLen+= 17; /* intAmt */
		messageLen+= 17; /* tax */
		messageLen+= 17; /* rvrsdIntAmt */
		messageLen+= 17; /* rvrsdTax */
		{/*stlmntList*/
			int size=500;
			int count= stlmntList.size();
			int min= size > count?count:size;
			bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub emptyElement= null;
			for ( int i = 0; i < size ; ++i ){
				if ( i < min ){
					bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub element= stlmntList.get(i);
					if ( element != null && !(element instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= element==null?0:( (Predictable)element).predictMessageLength();
				}else{
					if ( emptyElement== null ) emptyElement= new bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub();
					if ( !(emptyElement instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= ( (Predictable)emptyElement).predictMessageLength();
				}
			}
		}
		messageLen+= 20; /* custId */
		messageLen+= 20; /* custNm */
		messageLen+= 20; /* crncyCd */
		messageLen+= 20; /* pdNm */
		messageLen+= 20; /* arrStsCd */
		messageLen+= 20; /* mgmtDeptId */
		messageLen+= 20; /* mgmtDeptNm */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("arrOpnDt");
	
		fieldNames.add("arrMtrtyDt");
	
		fieldNames.add("intCalcnStartDt");
	
		fieldNames.add("intCalcnEndDt");
	
		fieldNames.add("acctBal");
	
		fieldNames.add("intAmt");
	
		fieldNames.add("tax");
	
		fieldNames.add("rvrsdIntAmt");
	
		fieldNames.add("rvrsdTax");
	
		fieldNames.add("stlmntList");
	
		fieldNames.add("custId");
	
		fieldNames.add("custNm");
	
		fieldNames.add("crncyCd");
	
		fieldNames.add("pdNm");
	
		fieldNames.add("arrStsCd");
	
		fieldNames.add("mgmtDeptId");
	
		fieldNames.add("mgmtDeptNm");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("arrOpnDt", get("arrOpnDt"));
	
		fieldValueMap.put("arrMtrtyDt", get("arrMtrtyDt"));
	
		fieldValueMap.put("intCalcnStartDt", get("intCalcnStartDt"));
	
		fieldValueMap.put("intCalcnEndDt", get("intCalcnEndDt"));
	
		fieldValueMap.put("acctBal", get("acctBal"));
	
		fieldValueMap.put("intAmt", get("intAmt"));
	
		fieldValueMap.put("tax", get("tax"));
	
		fieldValueMap.put("rvrsdIntAmt", get("rvrsdIntAmt"));
	
		fieldValueMap.put("rvrsdTax", get("rvrsdTax"));
	
		fieldValueMap.put("stlmntList", get("stlmntList"));
	
		fieldValueMap.put("custId", get("custId"));
	
		fieldValueMap.put("custNm", get("custNm"));
	
		fieldValueMap.put("crncyCd", get("crncyCd"));
	
		fieldValueMap.put("pdNm", get("pdNm"));
	
		fieldValueMap.put("arrStsCd", get("arrStsCd"));
	
		fieldValueMap.put("mgmtDeptId", get("mgmtDeptId"));
	
		fieldValueMap.put("mgmtDeptNm", get("mgmtDeptNm"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -1309758916 : /* arrOpnDt */
			return getArrOpnDt();
		case -1908260225 : /* arrMtrtyDt */
			return getArrMtrtyDt();
		case 1680338728 : /* intCalcnStartDt */
			return getIntCalcnStartDt();
		case -1097390367 : /* intCalcnEndDt */
			return getIntCalcnEndDt();
		case -1177219334 : /* acctBal */
			return getAcctBal();
		case -1183797415 : /* intAmt */
			return getIntAmt();
		case 114603 : /* tax */
			return getTax();
		case -988342856 : /* rvrsdIntAmt */
			return getRvrsdIntAmt();
		case 1836125612 : /* rvrsdTax */
			return getRvrsdTax();
		case 121775526 : /* stlmntList */
			return getStlmntList();
		case -1349089586 : /* custId */
			return getCustId();
		case -1349089422 : /* custNm */
			return getCustNm();
		case 1036929494 : /* crncyCd */
			return getCrncyCd();
		case 3435219 : /* pdNm */
			return getPdNm();
		case -1305940910 : /* arrStsCd */
			return getArrStsCd();
		case 1473134177 : /* mgmtDeptId */
			return getMgmtDeptId();
		case 1473134341 : /* mgmtDeptNm */
			return getMgmtDeptNm();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -1309758916 : /* arrOpnDt */
			setArrOpnDt((java.lang.String) value);
			return;
		case -1908260225 : /* arrMtrtyDt */
			setArrMtrtyDt((java.lang.String) value);
			return;
		case 1680338728 : /* intCalcnStartDt */
			setIntCalcnStartDt((java.lang.String) value);
			return;
		case -1097390367 : /* intCalcnEndDt */
			setIntCalcnEndDt((java.lang.String) value);
			return;
		case -1177219334 : /* acctBal */
			setAcctBal((java.math.BigDecimal) value);
			return;
		case -1183797415 : /* intAmt */
			setIntAmt((java.math.BigDecimal) value);
			return;
		case 114603 : /* tax */
			setTax((java.math.BigDecimal) value);
			return;
		case -988342856 : /* rvrsdIntAmt */
			setRvrsdIntAmt((java.math.BigDecimal) value);
			return;
		case 1836125612 : /* rvrsdTax */
			setRvrsdTax((java.math.BigDecimal) value);
			return;
		case 121775526 : /* stlmntList */
			setStlmntList((java.util.List<bankware.corebanking.deposit.simulation.service.dto.IntSmltnSvcOutSub>) value);
			return;
		case -1349089586 : /* custId */
			setCustId((java.lang.String) value);
			return;
		case -1349089422 : /* custNm */
			setCustNm((java.lang.String) value);
			return;
		case 1036929494 : /* crncyCd */
			setCrncyCd((java.lang.String) value);
			return;
		case 3435219 : /* pdNm */
			setPdNm((java.lang.String) value);
			return;
		case -1305940910 : /* arrStsCd */
			setArrStsCd((java.lang.String) value);
			return;
		case 1473134177 : /* mgmtDeptId */
			setMgmtDeptId((java.lang.String) value);
			return;
		case 1473134341 : /* mgmtDeptNm */
			setMgmtDeptNm((java.lang.String) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
