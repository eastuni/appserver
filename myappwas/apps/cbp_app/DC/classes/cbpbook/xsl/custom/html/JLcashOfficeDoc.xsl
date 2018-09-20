<?xml version="1.0" encoding="ASCII"?>
<!--This file was created automatically by html2xhtml-->
<!--from the HTML stylesheets.-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ng="http://docbook.org/docbook-ng" xmlns:db="http://docbook.org/ns/docbook" xmlns:exsl="http://exslt.org/common" xmlns:exslt="http://exslt.org/common" xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="db ng exsl exslt" version="1.0">

<!-- ********************************************************************
     $Id: docbook.xsl 9605 2012-09-18 10:48:54Z tom_schr $
     ********************************************************************

     This file is part of the XSL DocBook Stylesheet distribution.
     See ../README or http://docbook.sf.net/release/xsl/current/ for
     copyright and other information.

     ******************************************************************** -->

<!-- ==================================================================== -->

<xsl:include href="../../cbpbook/xhtml/cbpbook.xsl"/>

<!-- define parameter -->
<xsl:param name="table.frame.border.thickness">2px</xsl:param>

<!-- define : cbp parameter -->
<xsl:param name="cbp.print.section.title">1</xsl:param>
<xsl:param name="cbp.css.source">


html {
  font-size: 10pt;
  line-height: 1.4; }



.doc_title {  
  font-weight: bold;
  font-size: 15pt;
  text-align: center;
}

.doc_table_left_title {
  font-size: 12pt;
  text-align: right;
}

th {
  font-weight: bold;
  text-align: center;
}

td.header {
  font-weight: bold;
  text-align: center;
}

div.table  {
   text-align: center;
}
</xsl:param>

<xsl:param name="cbp.css.link.url"></xsl:param>

</xsl:stylesheet>
  