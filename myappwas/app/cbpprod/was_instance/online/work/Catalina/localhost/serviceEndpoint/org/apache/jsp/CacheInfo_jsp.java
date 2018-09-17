/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: Apache Tomcat/8.0.26
 * Generated at: 2018-07-09 03:44:51 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import java.lang.*;
import java.io.*;
import java.util.*;
import bankware.corebanking.cache.*;
import com.fasterxml.jackson.databind.*;

public final class CacheInfo_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent,
                 org.apache.jasper.runtime.JspSourceImports {

public String getAllCacheNames(String strCacheName) {
		Set<String> unsortedCacheNames = DataCacheFactory.getAllCacheNames();
		if (unsortedCacheNames == null || unsortedCacheNames.isEmpty())
			return "";
		Set<String> sortedCacheNames = new TreeSet<String>(unsortedCacheNames);
		String result = "";

		Iterator<String> iterator = sortedCacheNames.iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			if (key.equals(strCacheName))
				result += "<option value=" + key + " selected>" + key + "</option> ";
			else
				result += "<option value=" + key + ">" + key + "</option> ";
		}
		return result;
	}

	public String getAllKeyAndValues(String strCacheName) throws IOException, Exception {
		if (strCacheName == null)
			return "";

		String result = "";
		Set<String> unsortedCacheNames = DataCacheFactory.getAllKeysOfCacheName(strCacheName);
		Set<String> sortedCacheNames = new TreeSet<String>(unsortedCacheNames);

		Iterator<String> iterator = sortedCacheNames.iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			result += "<tr><td> " + key + "</td>";
			Object objValue = DataCacheFactory.getCacheData(strCacheName, key);
			if (objValue != null)
				result += "<td> " + toStr(objValue) + "</td> </tr>";
			else
				result += "<td></td></tr>";
		}
		return result;
	}

	public String getAllKeys(String strCacheName) throws IOException, Exception {
		if (strCacheName == null)
			return "";

		String result = "";
		Set<String> unsortedCacheNames = DataCacheFactory.getAllKeysOfCacheName(strCacheName);
		Set<String> sortedCacheNames = new TreeSet<String>(unsortedCacheNames);

		Iterator<String> iterator = sortedCacheNames.iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			result += "<tr><td> " + key + "</td></tr>";
		}
		return result;
	}

	public String fromStr(Serializable o) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ObjectOutputStream oos = new ObjectOutputStream(baos);
		oos.writeObject(o);
		oos.close();
		return baos.toString();
	}

	public String toStr(Object o) throws IOException, Exception {
		if (o == null)
			return "";
		String result = new String((byte[]) o, "UTF8");
		return result;
	}
  private static final javax.servlet.jsp.JspFactory _jspxFactory =
          javax.servlet.jsp.JspFactory.getDefaultFactory();

  private static java.util.Map<java.lang.String,java.lang.Long> _jspx_dependants;

  private static final java.util.Set<java.lang.String> _jspx_imports_packages;

  private static final java.util.Set<java.lang.String> _jspx_imports_classes;

  static {
    _jspx_imports_packages = new java.util.HashSet<>();
    _jspx_imports_packages.add("javax.servlet");
    _jspx_imports_packages.add("com.fasterxml.jackson.databind");
    _jspx_imports_packages.add("java.util");
    _jspx_imports_packages.add("java.io");
    _jspx_imports_packages.add("java.lang");
    _jspx_imports_packages.add("javax.servlet.jsp");
    _jspx_imports_packages.add("bankware.corebanking.cache");
    _jspx_imports_packages.add("javax.servlet.http");
    _jspx_imports_classes = null;
  }

  private javax.el.ExpressionFactory _el_expressionfactory;
  private org.apache.tomcat.InstanceManager _jsp_instancemanager;

  public java.util.Map<java.lang.String,java.lang.Long> getDependants() {
    return _jspx_dependants;
  }

  public java.util.Set<java.lang.String> getPackageImports() {
    return _jspx_imports_packages;
  }

  public java.util.Set<java.lang.String> getClassImports() {
    return _jspx_imports_classes;
  }

  public void _jspInit() {
    _el_expressionfactory = _jspxFactory.getJspApplicationContext(getServletConfig().getServletContext()).getExpressionFactory();
    _jsp_instancemanager = org.apache.jasper.runtime.InstanceManagerFactory.getInstanceManager(getServletConfig());
  }

  public void _jspDestroy() {
  }

  public void _jspService(final javax.servlet.http.HttpServletRequest request, final javax.servlet.http.HttpServletResponse response)
        throws java.io.IOException, javax.servlet.ServletException {

final java.lang.String _jspx_method = request.getMethod();
if (!"GET".equals(_jspx_method) && !"POST".equals(_jspx_method) && !"HEAD".equals(_jspx_method) && !javax.servlet.DispatcherType.ERROR.equals(request.getDispatcherType())) {
response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "JSPs only permit GET POST or HEAD");
return;
}

    final javax.servlet.jsp.PageContext pageContext;
    javax.servlet.http.HttpSession session = null;
    final javax.servlet.ServletContext application;
    final javax.servlet.ServletConfig config;
    javax.servlet.jsp.JspWriter out = null;
    final java.lang.Object page = this;
    javax.servlet.jsp.JspWriter _jspx_out = null;
    javax.servlet.jsp.PageContext _jspx_page_context = null;


    try {
      response.setContentType("text/html; charset=UTF-8");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;

      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("<html>\n");
      out.write("<head>\n");
      out.write("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n");
      out.write("<script type=\"text/javascript\">\n");
      out.write("\n");
      out.write("\tfunction submitAction(action) {\n");
      out.write("\t\t//alert(selectCachenames.value);\n");
      out.write("\t\tdocument.myform.action.value=action;\n");
      out.write("\t\tdocument.myform.submit();\n");
      out.write("\t}\n");
      out.write("</script>\n");
      out.write("\n");
      out.write("<title>List Cache Information</title>\n");
      out.write("</head>\n");
      out.write("<body>\n");
      out.write("\t");

		out.println(new Date(System.currentTimeMillis()) + "<br>");
		String strCacheName = request.getParameter("cachenames");
		String action = request.getParameter("action");
		String msg = "";
		if ("clearAll".equals(action)) {
			DataCacheFactory.clearCacheAll();
			strCacheName = null;
			msg = "clear all Cache.";
		} else if (strCacheName != null && action != null) {
			msg = action +" "+ strCacheName;
		}
	
      out.write("\n");
      out.write("\t<br>\n");
      out.write("\tCache Status <br>\n");
      out.write("\t==========================================================<br>\n");
      out.write("\t");

		out.println("<pre>" + DataCacheFactory.getStatus() + "</pre>");
	
      out.write("\n");
      out.write("\t==========================================================<br>\n");
      out.write("\t");

		out.println("msg : " + msg);
	
      out.write("\n");
      out.write("\t<br><br>\n");
      out.write("\t<button onclick=\"javascript:submitAction('clearAll')\">ClearAllCache</button>\n");
      out.write("\n");
      out.write("\t");

		if (strCacheName != null) {
			if ("query".equals(action)) {
	
      out.write("\n");
      out.write("\t<button onclick=\"javascript:submitAction('clear')\">\n");
      out.write("\t\tClear\n");
      out.write("\t\t");

		out.println(strCacheName);
	
      out.write("\n");
      out.write("\t</button>\n");
      out.write("\t");

		} else if ("clear".equals(action)) {
				DataCacheFactory.clearCache(strCacheName);
				strCacheName = null;
			}
		}
	
      out.write("\n");
      out.write("\t\n");
      out.write("\t<hr>\n");
      out.write("\tBiz Cache List\n");
      out.write("\t<br>\n");
      out.write("\n");
      out.write("\t<form name=\"myform\" action=\"CacheInfo.jsp\" method=\"post\">\n");
      out.write("\t\t<input type=\"hidden\" name=\"action\" value=\"\" /> \n");
      out.write("\n");
      out.write("\t\t<select\tname=\"cachenames\" onChange=\"javascript:submitAction('query')\">\n");
      out.write("\t\t\t");

				out.println(getAllCacheNames(strCacheName));
			
      out.write("\n");
      out.write("\t\t</select>\n");
      out.write("\t</form>\n");
      out.write("\t");

		if (strCacheName != null) {
	
      out.write("\n");
      out.write("\tsize :\n");
      out.write("\t");

		out.println(DataCacheFactory.getCacheSize(strCacheName));
	
      out.write("\n");
      out.write("\t<br>\n");
      out.write("\t\n");
      out.write("\t<table border=1>\n");
      out.write("\t\t<tr>\n");
      out.write("\t\t\t<td align=\"center\">key</td>\n");
      out.write("\t\t</tr>\n");
      out.write("\t\t");

			out.println(getAllKeys(strCacheName));
		
      out.write("\n");
      out.write("\t</table>\n");
      out.write("\t");

		}
	
      out.write("\n");
      out.write("</body>\n");
      out.write("</html>\n");
    } catch (java.lang.Throwable t) {
      if (!(t instanceof javax.servlet.jsp.SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          try {
            if (response.isCommitted()) {
              out.flush();
            } else {
              out.clearBuffer();
            }
          } catch (java.io.IOException e) {}
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
        else throw new ServletException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
