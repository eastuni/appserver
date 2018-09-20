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
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlRootElement;
import com.fasterxml.jackson.annotation.JsonIgnore;
import bxm.omm.predict.FieldInfo;

/**
 * @Description 
 */
@XmlType(propOrder={"prncpl", "txAmt", "intAmt", "tax", "rvrsdIntAmt", "rvrsdTax", "txDt", "txHms", "txSeqNbr", "arrId", "nthNbr", "arrStsCd", "pdNm", "custNm", "custId", "arrOpnDt", "arrTrmntnDt", "arrMtrtyDt", "aplyIntRt", "crncyCd", "lastBal", "oprtnAcctNbr", "stlmntList", "mgmtDeptId", "mgmtDeptNm", "rdpstAmtDscd", "rdpstAmt"}, name="ClsSmltnSvcOut")
@XmlRootElement(name="ClsSmltnSvcOut")
@SuppressWarnings("all")
public class ClsSmltnSvcOut extends bankware.corebanking.dto.CbbIOmmObject {

	private static final long serialVersionUID = -143486061L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << prncpl >> [[ */
	
	@XmlTransient
	private boolean isSet_prncpl = false;
	
	protected boolean isSet_prncpl()
	{
		return this.isSet_prncpl;
	}
	
	protected void setIsSet_prncpl(boolean value)
	{
		this.isSet_prncpl = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 원금
	 */
	public void setPrncpl(java.lang.String value) {
		isSet_prncpl = true;
		this.prncpl = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 원금
	 */
	public void setPrncpl(double value) {
		isSet_prncpl = true;
		this.prncpl = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 원금
	 */
	public void setPrncpl(long value) {
		isSet_prncpl = true;
		this.prncpl = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="원금", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal prncpl  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 원금
	 */
	public java.math.BigDecimal getPrncpl(){
		return prncpl;
	}
	
	/**
	 * @Description 원금
	 */
	@JsonProperty("prncpl")
	public void setPrncpl( java.math.BigDecimal prncpl ) {
		isSet_prncpl = true;
		this.prncpl = prncpl;
	}
	
	/** Property set << prncpl >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << txAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_txAmt = false;
	
	protected boolean isSet_txAmt()
	{
		return this.isSet_txAmt;
	}
	
	protected void setIsSet_txAmt(boolean value)
	{
		this.isSet_txAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 거래금액
	 */
	public void setTxAmt(java.lang.String value) {
		isSet_txAmt = true;
		this.txAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 거래금액
	 */
	public void setTxAmt(double value) {
		isSet_txAmt = true;
		this.txAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 거래금액
	 */
	public void setTxAmt(long value) {
		isSet_txAmt = true;
		this.txAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="거래금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal txAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 거래금액
	 */
	public java.math.BigDecimal getTxAmt(){
		return txAmt;
	}
	
	/**
	 * @Description 거래금액
	 */
	@JsonProperty("txAmt")
	public void setTxAmt( java.math.BigDecimal txAmt ) {
		isSet_txAmt = true;
		this.txAmt = txAmt;
	}
	
	/** Property set << txAmt >> ]]
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
	 * @Description 환입이자금액
	 */
	public void setRvrsdIntAmt(java.lang.String value) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 환입이자금액
	 */
	public void setRvrsdIntAmt(double value) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 환입이자금액
	 */
	public void setRvrsdIntAmt(long value) {
		isSet_rvrsdIntAmt = true;
		this.rvrsdIntAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="환입이자금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal rvrsdIntAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 환입이자금액
	 */
	public java.math.BigDecimal getRvrsdIntAmt(){
		return rvrsdIntAmt;
	}
	
	/**
	 * @Description 환입이자금액
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
	 * @Description 환출세금금액
	 */
	public void setRvrsdTax(java.lang.String value) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 환출세금금액
	 */
	public void setRvrsdTax(double value) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 환출세금금액
	 */
	public void setRvrsdTax(long value) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="환출세금금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal rvrsdTax  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 환출세금금액
	 */
	public java.math.BigDecimal getRvrsdTax(){
		return rvrsdTax;
	}
	
	/**
	 * @Description 환출세금금액
	 */
	@JsonProperty("rvrsdTax")
	public void setRvrsdTax( java.math.BigDecimal rvrsdTax ) {
		isSet_rvrsdTax = true;
		this.rvrsdTax = rvrsdTax;
	}
	
	/** Property set << rvrsdTax >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << txDt >> [[ */
	
	@XmlTransient
	private boolean isSet_txDt = false;
	
	protected boolean isSet_txDt()
	{
		return this.isSet_txDt;
	}
	
	protected void setIsSet_txDt(boolean value)
	{
		this.isSet_txDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="거래년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String txDt  = null;
	
	/**
	 * @Description 거래년월일
	 */
	public java.lang.String getTxDt(){
		return txDt;
	}
	
	/**
	 * @Description 거래년월일
	 */
	@JsonProperty("txDt")
	public void setTxDt( java.lang.String txDt ) {
		isSet_txDt = true;
		this.txDt = txDt;
	}
	
	/** Property set << txDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << txHms >> [[ */
	
	@XmlTransient
	private boolean isSet_txHms = false;
	
	protected boolean isSet_txHms()
	{
		return this.isSet_txHms;
	}
	
	protected void setIsSet_txHms(boolean value)
	{
		this.isSet_txHms = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="거래시분초", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String txHms  = null;
	
	/**
	 * @Description 거래시분초
	 */
	public java.lang.String getTxHms(){
		return txHms;
	}
	
	/**
	 * @Description 거래시분초
	 */
	@JsonProperty("txHms")
	public void setTxHms( java.lang.String txHms ) {
		isSet_txHms = true;
		this.txHms = txHms;
	}
	
	/** Property set << txHms >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << txSeqNbr >> [[ */
	
	@XmlTransient
	private boolean isSet_txSeqNbr = false;
	
	protected boolean isSet_txSeqNbr()
	{
		return this.isSet_txSeqNbr;
	}
	
	protected void setIsSet_txSeqNbr(boolean value)
	{
		this.isSet_txSeqNbr = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="거래일련번호", formatType="", format="", align="right", length=7, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.Integer txSeqNbr  = 0;
	
	/**
	 * @Description 거래일련번호
	 */
	public java.lang.Integer getTxSeqNbr(){
		return txSeqNbr;
	}
	
	/**
	 * @Description 거래일련번호
	 */
	@JsonProperty("txSeqNbr")
	public void setTxSeqNbr( java.lang.Integer txSeqNbr ) {
		isSet_txSeqNbr = true;
		this.txSeqNbr = txSeqNbr;
	}
	
	/** Property set << txSeqNbr >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrId >> [[ */
	
	@XmlTransient
	private boolean isSet_arrId = false;
	
	protected boolean isSet_arrId()
	{
		return this.isSet_arrId;
	}
	
	protected void setIsSet_arrId(boolean value)
	{
		this.isSet_arrId = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약식별자", formatType="", format="", align="left", length=40, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrId  = null;
	
	/**
	 * @Description 계약식별자
	 */
	public java.lang.String getArrId(){
		return arrId;
	}
	
	/**
	 * @Description 계약식별자
	 */
	@JsonProperty("arrId")
	public void setArrId( java.lang.String arrId ) {
		isSet_arrId = true;
		this.arrId = arrId;
	}
	
	/** Property set << arrId >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << nthNbr >> [[ */
	
	@XmlTransient
	private boolean isSet_nthNbr = false;
	
	protected boolean isSet_nthNbr()
	{
		return this.isSet_nthNbr;
	}
	
	protected void setIsSet_nthNbr(boolean value)
	{
		this.isSet_nthNbr = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="회차번호", formatType="", format="", align="right", length=7, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.Integer nthNbr  = 0;
	
	/**
	 * @Description 회차번호
	 */
	public java.lang.Integer getNthNbr(){
		return nthNbr;
	}
	
	/**
	 * @Description 회차번호
	 */
	@JsonProperty("nthNbr")
	public void setNthNbr( java.lang.Integer nthNbr ) {
		isSet_nthNbr = true;
		this.nthNbr = nthNbr;
	}
	
	/** Property set << nthNbr >> ]]
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
	
	
	@BxmOmm_Field(referenceType="reference", description="계약상태코드", formatType="", format="", align="left", length=1, decimal=0, arrayReference="", fill="", comment="", validationRule="")
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
	
	
	@BxmOmm_Field(referenceType="reference", description="상품명", formatType="", format="", align="left", length=300, decimal=0, arrayReference="", fill="", comment="", validationRule="")
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
	
	
	@BxmOmm_Field(referenceType="reference", description="고객명", formatType="", format="", align="left", length=50, decimal=0, arrayReference="", fill="", comment="", validationRule="")
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
	
	
	@BxmOmm_Field(referenceType="reference", description="고객식별자", formatType="", format="", align="left", length=100, decimal=0, arrayReference="", fill="", comment="", validationRule="")
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
	
	
	@BxmOmm_Field(referenceType="reference", description="계약개설년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrOpnDt  = null;
	
	/**
	 * @Description 계약개설년월일
	 */
	public java.lang.String getArrOpnDt(){
		return arrOpnDt;
	}
	
	/**
	 * @Description 계약개설년월일
	 */
	@JsonProperty("arrOpnDt")
	public void setArrOpnDt( java.lang.String arrOpnDt ) {
		isSet_arrOpnDt = true;
		this.arrOpnDt = arrOpnDt;
	}
	
	/** Property set << arrOpnDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrTrmntnDt >> [[ */
	
	@XmlTransient
	private boolean isSet_arrTrmntnDt = false;
	
	protected boolean isSet_arrTrmntnDt()
	{
		return this.isSet_arrTrmntnDt;
	}
	
	protected void setIsSet_arrTrmntnDt(boolean value)
	{
		this.isSet_arrTrmntnDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약해지년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrTrmntnDt  = null;
	
	/**
	 * @Description 계약해지년월일
	 */
	public java.lang.String getArrTrmntnDt(){
		return arrTrmntnDt;
	}
	
	/**
	 * @Description 계약해지년월일
	 */
	@JsonProperty("arrTrmntnDt")
	public void setArrTrmntnDt( java.lang.String arrTrmntnDt ) {
		isSet_arrTrmntnDt = true;
		this.arrTrmntnDt = arrTrmntnDt;
	}
	
	/** Property set << arrTrmntnDt >> ]]
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
	
	
	@BxmOmm_Field(referenceType="reference", description="계약만기년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrMtrtyDt  = null;
	
	/**
	 * @Description 계약만기년월일
	 */
	public java.lang.String getArrMtrtyDt(){
		return arrMtrtyDt;
	}
	
	/**
	 * @Description 계약만기년월일
	 */
	@JsonProperty("arrMtrtyDt")
	public void setArrMtrtyDt( java.lang.String arrMtrtyDt ) {
		isSet_arrMtrtyDt = true;
		this.arrMtrtyDt = arrMtrtyDt;
	}
	
	/** Property set << arrMtrtyDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << aplyIntRt >> [[ */
	
	@XmlTransient
	private boolean isSet_aplyIntRt = false;
	
	protected boolean isSet_aplyIntRt()
	{
		return this.isSet_aplyIntRt;
	}
	
	protected void setIsSet_aplyIntRt(boolean value)
	{
		this.isSet_aplyIntRt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 적용이율
	 */
	public void setAplyIntRt(java.lang.String value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 적용이율
	 */
	public void setAplyIntRt(double value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 적용이율
	 */
	public void setAplyIntRt(long value) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="적용이율", formatType="", format="", align="right", length=10, decimal=4, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal aplyIntRt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 적용이율
	 */
	public java.math.BigDecimal getAplyIntRt(){
		return aplyIntRt;
	}
	
	/**
	 * @Description 적용이율
	 */
	@JsonProperty("aplyIntRt")
	public void setAplyIntRt( java.math.BigDecimal aplyIntRt ) {
		isSet_aplyIntRt = true;
		this.aplyIntRt = aplyIntRt;
	}
	
	/** Property set << aplyIntRt >> ]]
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
	
	
	@BxmOmm_Field(referenceType="reference", description="통화코드", formatType="", format="", align="left", length=3, decimal=0, arrayReference="", fill="", comment="", validationRule="")
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
	* Property set << lastBal >> [[ */
	
	@XmlTransient
	private boolean isSet_lastBal = false;
	
	protected boolean isSet_lastBal()
	{
		return this.isSet_lastBal;
	}
	
	protected void setIsSet_lastBal(boolean value)
	{
		this.isSet_lastBal = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 최종잔액
	 */
	public void setLastBal(java.lang.String value) {
		isSet_lastBal = true;
		this.lastBal = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 최종잔액
	 */
	public void setLastBal(double value) {
		isSet_lastBal = true;
		this.lastBal = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 최종잔액
	 */
	public void setLastBal(long value) {
		isSet_lastBal = true;
		this.lastBal = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="최종잔액", formatType="", format="", align="right", length=18, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal lastBal  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 최종잔액
	 */
	public java.math.BigDecimal getLastBal(){
		return lastBal;
	}
	
	/**
	 * @Description 최종잔액
	 */
	@JsonProperty("lastBal")
	public void setLastBal( java.math.BigDecimal lastBal ) {
		isSet_lastBal = true;
		this.lastBal = lastBal;
	}
	
	/** Property set << lastBal >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << oprtnAcctNbr >> [[ */
	
	@XmlTransient
	private boolean isSet_oprtnAcctNbr = false;
	
	protected boolean isSet_oprtnAcctNbr()
	{
		return this.isSet_oprtnAcctNbr;
	}
	
	protected void setIsSet_oprtnAcctNbr(boolean value)
	{
		this.isSet_oprtnAcctNbr = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="오퍼레이션계좌번호", formatType="", format="", align="left", length=15, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String oprtnAcctNbr  = null;
	
	/**
	 * @Description 오퍼레이션계좌번호
	 */
	public java.lang.String getOprtnAcctNbr(){
		return oprtnAcctNbr;
	}
	
	/**
	 * @Description 오퍼레이션계좌번호
	 */
	@JsonProperty("oprtnAcctNbr")
	public void setOprtnAcctNbr( java.lang.String oprtnAcctNbr ) {
		isSet_oprtnAcctNbr = true;
		this.oprtnAcctNbr = oprtnAcctNbr;
	}
	
	/** Property set << oprtnAcctNbr >> ]]
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
	
	
	@BxmOmm_Field(referenceType="reference", description="정산내역", formatType="", format="", align="left", length=0, decimal=0, arrayReference="20", fill="", comment="", validationRule="")
	private java.util.List<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub> stlmntList  = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub>();
	
	/**
	 * @Description 정산내역
	 */
	public java.util.List<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub>  getStlmntList(){
		return stlmntList;
	}
	
	/**
	 * @Description 정산내역
	 */
	@JsonProperty("stlmntList")
	public void setStlmntList( java.util.List<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub> stlmntList ) {
		isSet_stlmntList = true;
		this.stlmntList = stlmntList;
	}
	
	/** Property set << stlmntList >> ]]
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
	/*******************************************************************************************************************************
	* Property set << rdpstAmtDscd >> [[ */
	
	@XmlTransient
	private boolean isSet_rdpstAmtDscd = false;
	
	protected boolean isSet_rdpstAmtDscd()
	{
		return this.isSet_rdpstAmtDscd;
	}
	
	protected void setIsSet_rdpstAmtDscd(boolean value)
	{
		this.isSet_rdpstAmtDscd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="재예치금액구분", formatType="", format="", align="left", length=2, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String rdpstAmtDscd  = null;
	
	/**
	 * @Description 재예치금액구분
	 */
	public java.lang.String getRdpstAmtDscd(){
		return rdpstAmtDscd;
	}
	
	/**
	 * @Description 재예치금액구분
	 */
	@JsonProperty("rdpstAmtDscd")
	public void setRdpstAmtDscd( java.lang.String rdpstAmtDscd ) {
		isSet_rdpstAmtDscd = true;
		this.rdpstAmtDscd = rdpstAmtDscd;
	}
	
	/** Property set << rdpstAmtDscd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << rdpstAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_rdpstAmt = false;
	
	protected boolean isSet_rdpstAmt()
	{
		return this.isSet_rdpstAmt;
	}
	
	protected void setIsSet_rdpstAmt(boolean value)
	{
		this.isSet_rdpstAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 재예치금액
	 */
	public void setRdpstAmt(java.lang.String value) {
		isSet_rdpstAmt = true;
		this.rdpstAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 재예치금액
	 */
	public void setRdpstAmt(double value) {
		isSet_rdpstAmt = true;
		this.rdpstAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 재예치금액
	 */
	public void setRdpstAmt(long value) {
		isSet_rdpstAmt = true;
		this.rdpstAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="재예치금액", formatType="", format="", align="right", length=22, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal rdpstAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 재예치금액
	 */
	public java.math.BigDecimal getRdpstAmt(){
		return rdpstAmt;
	}
	
	/**
	 * @Description 재예치금액
	 */
	@JsonProperty("rdpstAmt")
	public void setRdpstAmt( java.math.BigDecimal rdpstAmt ) {
		isSet_rdpstAmt = true;
		this.rdpstAmt = rdpstAmt;
	}
	
	/** Property set << rdpstAmt >> ]]
	*******************************************************************************************************************************/

	@Override
	public ClsSmltnSvcOut clone(){
		try{
			ClsSmltnSvcOut object= (ClsSmltnSvcOut)super.clone();
			if ( this.prncpl== null ) object.prncpl = null;
			else{
				object.prncpl = new java.math.BigDecimal(prncpl.toString());
			}
			if ( this.txAmt== null ) object.txAmt = null;
			else{
				object.txAmt = new java.math.BigDecimal(txAmt.toString());
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
			if ( this.txDt== null ) object.txDt = null;
			else{
				object.txDt = this.txDt;
			}
			if ( this.txHms== null ) object.txHms = null;
			else{
				object.txHms = this.txHms;
			}
			if ( this.txSeqNbr== null ) object.txSeqNbr = null;
			else{
				object.txSeqNbr = this.txSeqNbr;
			}
			if ( this.arrId== null ) object.arrId = null;
			else{
				object.arrId = this.arrId;
			}
			if ( this.nthNbr== null ) object.nthNbr = null;
			else{
				object.nthNbr = this.nthNbr;
			}
			if ( this.arrStsCd== null ) object.arrStsCd = null;
			else{
				object.arrStsCd = this.arrStsCd;
			}
			if ( this.pdNm== null ) object.pdNm = null;
			else{
				object.pdNm = this.pdNm;
			}
			if ( this.custNm== null ) object.custNm = null;
			else{
				object.custNm = this.custNm;
			}
			if ( this.custId== null ) object.custId = null;
			else{
				object.custId = this.custId;
			}
			if ( this.arrOpnDt== null ) object.arrOpnDt = null;
			else{
				object.arrOpnDt = this.arrOpnDt;
			}
			if ( this.arrTrmntnDt== null ) object.arrTrmntnDt = null;
			else{
				object.arrTrmntnDt = this.arrTrmntnDt;
			}
			if ( this.arrMtrtyDt== null ) object.arrMtrtyDt = null;
			else{
				object.arrMtrtyDt = this.arrMtrtyDt;
			}
			if ( this.aplyIntRt== null ) object.aplyIntRt = null;
			else{
				object.aplyIntRt = new java.math.BigDecimal(aplyIntRt.toString());
			}
			if ( this.crncyCd== null ) object.crncyCd = null;
			else{
				object.crncyCd = this.crncyCd;
			}
			if ( this.lastBal== null ) object.lastBal = null;
			else{
				object.lastBal = new java.math.BigDecimal(lastBal.toString());
			}
			if ( this.oprtnAcctNbr== null ) object.oprtnAcctNbr = null;
			else{
				object.oprtnAcctNbr = this.oprtnAcctNbr;
			}
			if ( this.stlmntList== null ) object.stlmntList = null;
			else{
				java.util.List<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub> clonedList = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub>(stlmntList.size());
				for( bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub item : stlmntList ){
					clonedList.add( (bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub)item.clone());
				}
				object.stlmntList = clonedList;
			}
			if ( this.mgmtDeptId== null ) object.mgmtDeptId = null;
			else{
				object.mgmtDeptId = this.mgmtDeptId;
			}
			if ( this.mgmtDeptNm== null ) object.mgmtDeptNm = null;
			else{
				object.mgmtDeptNm = this.mgmtDeptNm;
			}
			if ( this.rdpstAmtDscd== null ) object.rdpstAmtDscd = null;
			else{
				object.rdpstAmtDscd = this.rdpstAmtDscd;
			}
			if ( this.rdpstAmt== null ) object.rdpstAmt = null;
			else{
				object.rdpstAmt = new java.math.BigDecimal(rdpstAmt.toString());
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
		result = prime * result + ((prncpl==null)?0:prncpl.hashCode());
		result = prime * result + ((txAmt==null)?0:txAmt.hashCode());
		result = prime * result + ((intAmt==null)?0:intAmt.hashCode());
		result = prime * result + ((tax==null)?0:tax.hashCode());
		result = prime * result + ((rvrsdIntAmt==null)?0:rvrsdIntAmt.hashCode());
		result = prime * result + ((rvrsdTax==null)?0:rvrsdTax.hashCode());
		result = prime * result + ((txDt==null)?0:txDt.hashCode());
		result = prime * result + ((txHms==null)?0:txHms.hashCode());
		result = prime * result + ((txSeqNbr==null)?0:txSeqNbr.hashCode());
		result = prime * result + ((arrId==null)?0:arrId.hashCode());
		result = prime * result + ((nthNbr==null)?0:nthNbr.hashCode());
		result = prime * result + ((arrStsCd==null)?0:arrStsCd.hashCode());
		result = prime * result + ((pdNm==null)?0:pdNm.hashCode());
		result = prime * result + ((custNm==null)?0:custNm.hashCode());
		result = prime * result + ((custId==null)?0:custId.hashCode());
		result = prime * result + ((arrOpnDt==null)?0:arrOpnDt.hashCode());
		result = prime * result + ((arrTrmntnDt==null)?0:arrTrmntnDt.hashCode());
		result = prime * result + ((arrMtrtyDt==null)?0:arrMtrtyDt.hashCode());
		result = prime * result + ((aplyIntRt==null)?0:aplyIntRt.hashCode());
		result = prime * result + ((crncyCd==null)?0:crncyCd.hashCode());
		result = prime * result + ((lastBal==null)?0:lastBal.hashCode());
		result = prime * result + ((oprtnAcctNbr==null)?0:oprtnAcctNbr.hashCode());
		result = prime * result + ((stlmntList==null)?0:stlmntList.hashCode());
		result = prime * result + ((mgmtDeptId==null)?0:mgmtDeptId.hashCode());
		result = prime * result + ((mgmtDeptNm==null)?0:mgmtDeptNm.hashCode());
		result = prime * result + ((rdpstAmtDscd==null)?0:rdpstAmtDscd.hashCode());
		result = prime * result + ((rdpstAmt==null)?0:rdpstAmt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOut other = (bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOut)obj;
		if ( prncpl == null ){
			if ( other.prncpl != null ) return false;
		}
		else if ( !prncpl.equals(other.prncpl) )
			return false;
		if ( txAmt == null ){
			if ( other.txAmt != null ) return false;
		}
		else if ( !txAmt.equals(other.txAmt) )
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
		if ( txDt == null ){
			if ( other.txDt != null ) return false;
		}
		else if ( !txDt.equals(other.txDt) )
			return false;
		if ( txHms == null ){
			if ( other.txHms != null ) return false;
		}
		else if ( !txHms.equals(other.txHms) )
			return false;
		if ( txSeqNbr == null ){
			if ( other.txSeqNbr != null ) return false;
		}
		else if ( !txSeqNbr.equals(other.txSeqNbr) )
			return false;
		if ( arrId == null ){
			if ( other.arrId != null ) return false;
		}
		else if ( !arrId.equals(other.arrId) )
			return false;
		if ( nthNbr == null ){
			if ( other.nthNbr != null ) return false;
		}
		else if ( !nthNbr.equals(other.nthNbr) )
			return false;
		if ( arrStsCd == null ){
			if ( other.arrStsCd != null ) return false;
		}
		else if ( !arrStsCd.equals(other.arrStsCd) )
			return false;
		if ( pdNm == null ){
			if ( other.pdNm != null ) return false;
		}
		else if ( !pdNm.equals(other.pdNm) )
			return false;
		if ( custNm == null ){
			if ( other.custNm != null ) return false;
		}
		else if ( !custNm.equals(other.custNm) )
			return false;
		if ( custId == null ){
			if ( other.custId != null ) return false;
		}
		else if ( !custId.equals(other.custId) )
			return false;
		if ( arrOpnDt == null ){
			if ( other.arrOpnDt != null ) return false;
		}
		else if ( !arrOpnDt.equals(other.arrOpnDt) )
			return false;
		if ( arrTrmntnDt == null ){
			if ( other.arrTrmntnDt != null ) return false;
		}
		else if ( !arrTrmntnDt.equals(other.arrTrmntnDt) )
			return false;
		if ( arrMtrtyDt == null ){
			if ( other.arrMtrtyDt != null ) return false;
		}
		else if ( !arrMtrtyDt.equals(other.arrMtrtyDt) )
			return false;
		if ( aplyIntRt == null ){
			if ( other.aplyIntRt != null ) return false;
		}
		else if ( !aplyIntRt.equals(other.aplyIntRt) )
			return false;
		if ( crncyCd == null ){
			if ( other.crncyCd != null ) return false;
		}
		else if ( !crncyCd.equals(other.crncyCd) )
			return false;
		if ( lastBal == null ){
			if ( other.lastBal != null ) return false;
		}
		else if ( !lastBal.equals(other.lastBal) )
			return false;
		if ( oprtnAcctNbr == null ){
			if ( other.oprtnAcctNbr != null ) return false;
		}
		else if ( !oprtnAcctNbr.equals(other.oprtnAcctNbr) )
			return false;
		if ( stlmntList == null ){
			if ( other.stlmntList != null ) return false;
		}
		else if ( !stlmntList.equals(other.stlmntList) )
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
		if ( rdpstAmtDscd == null ){
			if ( other.rdpstAmtDscd != null ) return false;
		}
		else if ( !rdpstAmtDscd.equals(other.rdpstAmtDscd) )
			return false;
		if ( rdpstAmt == null ){
			if ( other.rdpstAmt != null ) return false;
		}
		else if ( !rdpstAmt.equals(other.rdpstAmt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append(super.toString());
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOut:\n");
		sb.append("\tprncpl: ");
		sb.append(prncpl==null?"null":getPrncpl());
		sb.append("\n");
		sb.append("\ttxAmt: ");
		sb.append(txAmt==null?"null":getTxAmt());
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
		sb.append("\ttxDt: ");
		sb.append(txDt==null?"null":getTxDt());
		sb.append("\n");
		sb.append("\ttxHms: ");
		sb.append(txHms==null?"null":getTxHms());
		sb.append("\n");
		sb.append("\ttxSeqNbr: ");
		sb.append(txSeqNbr==null?"null":getTxSeqNbr());
		sb.append("\n");
		sb.append("\tarrId: ");
		sb.append(arrId==null?"null":getArrId());
		sb.append("\n");
		sb.append("\tnthNbr: ");
		sb.append(nthNbr==null?"null":getNthNbr());
		sb.append("\n");
		sb.append("\tarrStsCd: ");
		sb.append(arrStsCd==null?"null":getArrStsCd());
		sb.append("\n");
		sb.append("\tpdNm: ");
		sb.append(pdNm==null?"null":getPdNm());
		sb.append("\n");
		sb.append("\tcustNm: ");
		sb.append(custNm==null?"null":getCustNm());
		sb.append("\n");
		sb.append("\tcustId: ");
		sb.append(custId==null?"null":getCustId());
		sb.append("\n");
		sb.append("\tarrOpnDt: ");
		sb.append(arrOpnDt==null?"null":getArrOpnDt());
		sb.append("\n");
		sb.append("\tarrTrmntnDt: ");
		sb.append(arrTrmntnDt==null?"null":getArrTrmntnDt());
		sb.append("\n");
		sb.append("\tarrMtrtyDt: ");
		sb.append(arrMtrtyDt==null?"null":getArrMtrtyDt());
		sb.append("\n");
		sb.append("\taplyIntRt: ");
		sb.append(aplyIntRt==null?"null":getAplyIntRt());
		sb.append("\n");
		sb.append("\tcrncyCd: ");
		sb.append(crncyCd==null?"null":getCrncyCd());
		sb.append("\n");
		sb.append("\tlastBal: ");
		sb.append(lastBal==null?"null":getLastBal());
		sb.append("\n");
		sb.append("\toprtnAcctNbr: ");
		sb.append(oprtnAcctNbr==null?"null":getOprtnAcctNbr());
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
		sb.append("\tmgmtDeptId: ");
		sb.append(mgmtDeptId==null?"null":getMgmtDeptId());
		sb.append("\n");
		sb.append("\tmgmtDeptNm: ");
		sb.append(mgmtDeptNm==null?"null":getMgmtDeptNm());
		sb.append("\n");
		sb.append("\trdpstAmtDscd: ");
		sb.append(rdpstAmtDscd==null?"null":getRdpstAmtDscd());
		sb.append("\n");
		sb.append("\trdpstAmt: ");
		sb.append(rdpstAmt==null?"null":getRdpstAmt());
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
	
		messageLen+= 17; /* prncpl */
		messageLen+= 17; /* txAmt */
		messageLen+= 17; /* intAmt */
		messageLen+= 17; /* tax */
		messageLen+= 17; /* rvrsdIntAmt */
		messageLen+= 17; /* rvrsdTax */
		messageLen+= 8; /* txDt */
		messageLen+= 8; /* txHms */
		messageLen+= 7; /* txSeqNbr */
		messageLen+= 40; /* arrId */
		messageLen+= 7; /* nthNbr */
		messageLen+= 1; /* arrStsCd */
		messageLen+= 300; /* pdNm */
		messageLen+= 50; /* custNm */
		messageLen+= 100; /* custId */
		messageLen+= 8; /* arrOpnDt */
		messageLen+= 8; /* arrTrmntnDt */
		messageLen+= 8; /* arrMtrtyDt */
		messageLen+= 10; /* aplyIntRt */
		messageLen+= 3; /* crncyCd */
		messageLen+= 18; /* lastBal */
		messageLen+= 15; /* oprtnAcctNbr */
		{/*stlmntList*/
			int size=20;
			int count= stlmntList.size();
			int min= size > count?count:size;
			bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub emptyElement= null;
			for ( int i = 0; i < size ; ++i ){
				if ( i < min ){
					bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub element= stlmntList.get(i);
					if ( element != null && !(element instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= element==null?0:( (Predictable)element).predictMessageLength();
				}else{
					if ( emptyElement== null ) emptyElement= new bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub();
					if ( !(emptyElement instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= ( (Predictable)emptyElement).predictMessageLength();
				}
			}
		}
		messageLen+= 20; /* mgmtDeptId */
		messageLen+= 20; /* mgmtDeptNm */
		messageLen+= 2; /* rdpstAmtDscd */
		messageLen+= 22; /* rdpstAmt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("prncpl");
	
		fieldNames.add("txAmt");
	
		fieldNames.add("intAmt");
	
		fieldNames.add("tax");
	
		fieldNames.add("rvrsdIntAmt");
	
		fieldNames.add("rvrsdTax");
	
		fieldNames.add("txDt");
	
		fieldNames.add("txHms");
	
		fieldNames.add("txSeqNbr");
	
		fieldNames.add("arrId");
	
		fieldNames.add("nthNbr");
	
		fieldNames.add("arrStsCd");
	
		fieldNames.add("pdNm");
	
		fieldNames.add("custNm");
	
		fieldNames.add("custId");
	
		fieldNames.add("arrOpnDt");
	
		fieldNames.add("arrTrmntnDt");
	
		fieldNames.add("arrMtrtyDt");
	
		fieldNames.add("aplyIntRt");
	
		fieldNames.add("crncyCd");
	
		fieldNames.add("lastBal");
	
		fieldNames.add("oprtnAcctNbr");
	
		fieldNames.add("stlmntList");
	
		fieldNames.add("mgmtDeptId");
	
		fieldNames.add("mgmtDeptNm");
	
		fieldNames.add("rdpstAmtDscd");
	
		fieldNames.add("rdpstAmt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("prncpl", get("prncpl"));
	
		fieldValueMap.put("txAmt", get("txAmt"));
	
		fieldValueMap.put("intAmt", get("intAmt"));
	
		fieldValueMap.put("tax", get("tax"));
	
		fieldValueMap.put("rvrsdIntAmt", get("rvrsdIntAmt"));
	
		fieldValueMap.put("rvrsdTax", get("rvrsdTax"));
	
		fieldValueMap.put("txDt", get("txDt"));
	
		fieldValueMap.put("txHms", get("txHms"));
	
		fieldValueMap.put("txSeqNbr", get("txSeqNbr"));
	
		fieldValueMap.put("arrId", get("arrId"));
	
		fieldValueMap.put("nthNbr", get("nthNbr"));
	
		fieldValueMap.put("arrStsCd", get("arrStsCd"));
	
		fieldValueMap.put("pdNm", get("pdNm"));
	
		fieldValueMap.put("custNm", get("custNm"));
	
		fieldValueMap.put("custId", get("custId"));
	
		fieldValueMap.put("arrOpnDt", get("arrOpnDt"));
	
		fieldValueMap.put("arrTrmntnDt", get("arrTrmntnDt"));
	
		fieldValueMap.put("arrMtrtyDt", get("arrMtrtyDt"));
	
		fieldValueMap.put("aplyIntRt", get("aplyIntRt"));
	
		fieldValueMap.put("crncyCd", get("crncyCd"));
	
		fieldValueMap.put("lastBal", get("lastBal"));
	
		fieldValueMap.put("oprtnAcctNbr", get("oprtnAcctNbr"));
	
		fieldValueMap.put("stlmntList", get("stlmntList"));
	
		fieldValueMap.put("mgmtDeptId", get("mgmtDeptId"));
	
		fieldValueMap.put("mgmtDeptNm", get("mgmtDeptNm"));
	
		fieldValueMap.put("rdpstAmtDscd", get("rdpstAmtDscd"));
	
		fieldValueMap.put("rdpstAmt", get("rdpstAmt"));
	
	
		return fieldValueMap;
	}

	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -979845261 : /* prncpl */
			return getPrncpl();
		case 110769316 : /* txAmt */
			return getTxAmt();
		case -1183797415 : /* intAmt */
			return getIntAmt();
		case 114603 : /* tax */
			return getTax();
		case -988342856 : /* rvrsdIntAmt */
			return getRvrsdIntAmt();
		case 1836125612 : /* rvrsdTax */
			return getRvrsdTax();
		case 3573300 : /* txDt */
			return getTxDt();
		case 110776042 : /* txHms */
			return getTxHms();
		case 1901734915 : /* txSeqNbr */
			return getTxSeqNbr();
		case 93089628 : /* arrId */
			return getArrId();
		case -1035455876 : /* nthNbr */
			return getNthNbr();
		case -1305940910 : /* arrStsCd */
			return getArrStsCd();
		case 3435219 : /* pdNm */
			return getPdNm();
		case -1349089422 : /* custNm */
			return getCustNm();
		case -1349089586 : /* custId */
			return getCustId();
		case -1309758916 : /* arrOpnDt */
			return getArrOpnDt();
		case -1635558582 : /* arrTrmntnDt */
			return getArrTrmntnDt();
		case -1908260225 : /* arrMtrtyDt */
			return getArrMtrtyDt();
		case -1002076683 : /* aplyIntRt */
			return getAplyIntRt();
		case 1036929494 : /* crncyCd */
			return getCrncyCd();
		case -47095401 : /* lastBal */
			return getLastBal();
		case 832221376 : /* oprtnAcctNbr */
			return getOprtnAcctNbr();
		case 121775526 : /* stlmntList */
			return getStlmntList();
		case 1473134177 : /* mgmtDeptId */
			return getMgmtDeptId();
		case 1473134341 : /* mgmtDeptNm */
			return getMgmtDeptNm();
		case 1381087929 : /* rdpstAmtDscd */
			return getRdpstAmtDscd();
		case -1310838295 : /* rdpstAmt */
			return getRdpstAmt();
		default :
			return super.get(key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -979845261 : /* prncpl */
			setPrncpl((java.math.BigDecimal) value);
			return;
		case 110769316 : /* txAmt */
			setTxAmt((java.math.BigDecimal) value);
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
		case 3573300 : /* txDt */
			setTxDt((java.lang.String) value);
			return;
		case 110776042 : /* txHms */
			setTxHms((java.lang.String) value);
			return;
		case 1901734915 : /* txSeqNbr */
			setTxSeqNbr((java.lang.Integer) value);
			return;
		case 93089628 : /* arrId */
			setArrId((java.lang.String) value);
			return;
		case -1035455876 : /* nthNbr */
			setNthNbr((java.lang.Integer) value);
			return;
		case -1305940910 : /* arrStsCd */
			setArrStsCd((java.lang.String) value);
			return;
		case 3435219 : /* pdNm */
			setPdNm((java.lang.String) value);
			return;
		case -1349089422 : /* custNm */
			setCustNm((java.lang.String) value);
			return;
		case -1349089586 : /* custId */
			setCustId((java.lang.String) value);
			return;
		case -1309758916 : /* arrOpnDt */
			setArrOpnDt((java.lang.String) value);
			return;
		case -1635558582 : /* arrTrmntnDt */
			setArrTrmntnDt((java.lang.String) value);
			return;
		case -1908260225 : /* arrMtrtyDt */
			setArrMtrtyDt((java.lang.String) value);
			return;
		case -1002076683 : /* aplyIntRt */
			setAplyIntRt((java.math.BigDecimal) value);
			return;
		case 1036929494 : /* crncyCd */
			setCrncyCd((java.lang.String) value);
			return;
		case -47095401 : /* lastBal */
			setLastBal((java.math.BigDecimal) value);
			return;
		case 832221376 : /* oprtnAcctNbr */
			setOprtnAcctNbr((java.lang.String) value);
			return;
		case 121775526 : /* stlmntList */
			setStlmntList((java.util.List<bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcOutSub>) value);
			return;
		case 1473134177 : /* mgmtDeptId */
			setMgmtDeptId((java.lang.String) value);
			return;
		case 1473134341 : /* mgmtDeptNm */
			setMgmtDeptNm((java.lang.String) value);
			return;
		case 1381087929 : /* rdpstAmtDscd */
			setRdpstAmtDscd((java.lang.String) value);
			return;
		case -1310838295 : /* rdpstAmt */
			setRdpstAmt((java.math.BigDecimal) value);
			return;
		default : super.set(key, value);
		}
	}
}
