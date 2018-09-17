/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: Apache Tomcat/8.0.26
 * Generated at: 2018-07-06 06:02:37 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import java.util.LinkedList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.List;
import org.apache.log4j.Category;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

public final class log4jLevel_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent,
                 org.apache.jasper.runtime.JspSourceImports {


	public static List<Category> getAllCategories() {
		Logger root = Logger.getRootLogger();
		
		List<Category> results = new LinkedList<Category>();
/*	Enumeration currentCategories = root.getLoggerRepository().getCurrentCategories();
		while(currentCategories.hasMoreElements()) {
			Category category = (Category) currentCategories.nextElement();
			results.add(category);
		}
		
		Collections.sort(results, new Comparator<Category>(){
			public int compare(Category o1, Category o2) {
				if (o1 == null || o2 == null) return 0;
				if (o1.getName() == null || o2.getName() == null) return 0;
				return o1.getName().compareTo(o2.getName());
			}});
*/		
		results.add(0, root);
		
		return results;
	}
	
	public static void setLogLeve(String categoryName, Level level) {
		Category category = findCategory(categoryName);
		if (category == null) {
			System.out.println("[Log4JUtil] Can not find category: " + categoryName);
			return;
		}
		
		category.setLevel(level);
	}
	
	private static Category findCategory(String categoryName) {
		if (categoryName == null) return null;
		Logger root = Logger.getRootLogger();
		if ("root".equals(categoryName)) return root;
		Enumeration categories = root.getLoggerRepository().getCurrentCategories();
		while(categories.hasMoreElements()) {
			Category category = (Category) categories.nextElement();
			if (categoryName.equals(category.getName())) return category;
		}
		return null;
	}

  private static final javax.servlet.jsp.JspFactory _jspxFactory =
          javax.servlet.jsp.JspFactory.getDefaultFactory();

  private static java.util.Map<java.lang.String,java.lang.Long> _jspx_dependants;

  private static final java.util.Set<java.lang.String> _jspx_imports_packages;

  private static final java.util.Set<java.lang.String> _jspx_imports_classes;

  static {
    _jspx_imports_packages = new java.util.HashSet<>();
    _jspx_imports_packages.add("javax.servlet");
    _jspx_imports_packages.add("javax.servlet.jsp");
    _jspx_imports_packages.add("javax.servlet.http");
    _jspx_imports_classes = new java.util.HashSet<>();
    _jspx_imports_classes.add("java.util.Enumeration");
    _jspx_imports_classes.add("java.util.LinkedList");
    _jspx_imports_classes.add("java.util.Comparator");
    _jspx_imports_classes.add("java.util.List");
    _jspx_imports_classes.add("java.util.Collections");
    _jspx_imports_classes.add("org.apache.log4j.Logger");
    _jspx_imports_classes.add("org.apache.log4j.Level");
    _jspx_imports_classes.add("org.apache.log4j.Category");
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
      response.setContentType("text/html;charset=UTF-8");
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
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write('\n');

	String level = request.getParameter("level");
	String[] categoryNames = request.getParameterValues("categoryNames");
	if (level != null && level.trim().length() > 0) {
		if (categoryNames == null) categoryNames = new String[0];
		for(String categoryName : categoryNames) {
			setLogLeve(categoryName, Level.toLevel(level, null));
		}
		response.sendRedirect("log4jLevel.jsp");
		return;
	}

      out.write("\n");
      out.write("\n");
      out.write("<html>\n");
      out.write("<head>\n");
      out.write("<title>Log4J levels</title>\n");
      out.write("<style type=\"text/css\">\n");
      out.write("h1 { font-size:20px; }\n");
      out.write("th {\n");
      out.write("    text-align:left;\n");
      out.write("    color:#fff;\n");
      out.write("    background-color:#000;\n");
      out.write("}\n");
      out.write("td {\n");
      out.write("    text-align:left;\n");
      out.write("    background-color:#eee;\n");
      out.write("}\n");
      out.write(".l {text-align:left}\n");
      out.write(".c {text-align:center}\n");
      out.write("</style>\n");
      out.write("\n");
      out.write("<script>\n");
      out.write("function toggleCheckBox(checked) {\n");
      out.write("\tvar inputs = document.getElementsByTagName('input');\n");
      out.write("\tfor(var i = 0; i < inputs.length; i++) {\n");
      out.write("\t\tif (inputs[i].type != 'checkbox') continue;\n");
      out.write("\t\tif (inputs[i].name != 'categoryNames') continue;\n");
      out.write("\t\tinputs[i].checked = checked;\n");
      out.write("\t}\n");
      out.write("}\n");
      out.write("function iBatisSqlLog(isOn) {\n");
      out.write("\tvar iBatisSqlLogLevel = document.getElementById('iBatisSqlLogLevel');\n");
      out.write("\tif (isOn) {\n");
      out.write("\t\tiBatisSqlLogLevel.value = 'DEBUG';\n");
      out.write("\t} else {\n");
      out.write("\t\tiBatisSqlLogLevel.value = 'OFF';\n");
      out.write("\t}\n");
      out.write("\tdocument.getElementById('iBatisSqlLogForm').submit();\n");
      out.write("}\n");
      out.write("</script>\n");
      out.write("\n");
      out.write("</head>\n");
      out.write("\n");
      out.write("<body>\n");
      out.write("<h1>Log4J levels</h1>\n");
      out.write("\n");
      out.write("<form method=\"post\">\n");
      out.write("\t<select name=\"level\">\n");
      out.write("\t\t<option>DEBUG</option>\n");
      out.write("\t\t<option>INFO</option>\n");
      out.write("\t\t<option>WARN</option>\n");
      out.write("\t\t<option>ERROR</option>\n");
      out.write("\t\t<option>FATAL</option>\n");
      out.write("\t\t<option>OFF</option>\n");
      out.write("\t\t<option>TRACE</option>\n");
      out.write("\t\t<option>NULL</option>\n");
      out.write("\t</select>\n");
      out.write("\t<input type=\"submit\" value=\"Change all selected logger levels!\"/>\n");
      out.write("<!--\t<a href=\"javascript:iBatisSqlLog(true);\">[iBatis SQL log ON!]</a>\n");
      out.write("\t<a href=\"javascript:iBatisSqlLog(false);\">[iBatis SQL log OFF!]</a> -->\n");
      out.write("\t<table>\n");
      out.write("\t\t<col width=\"50\" />\n");
      out.write("\t\t<col width=\"*\" />\n");
      out.write("\t\t<col width=\"100\" />\n");
      out.write("\t\t<tr>\n");
      out.write("\t\t\t<th class=\"c\"><input name=\"selectAll\" type=\"checkbox\" onclick=\"toggleCheckBox(this.checked)\" checked /></th>\n");
      out.write("\t\t\t<th>Category</th>\n");
      out.write("\t\t\t<th>Level</th>\n");
      out.write("\t\t</tr>\n");
      out.write("\t\t");

			List<Category> categories = getAllCategories();
			for(Category category : categories) {
		
      out.write("\n");
      out.write("\t\t<tr>\n");
      out.write("\t\t\t<td class=\"c\"><input name=\"categoryNames\" type=\"checkbox\" value=\"");
      out.print(category.getName());
      out.write("\" checked /></td>\n");
      out.write("\t\t\t<td>");
      out.print(category.getName());
      out.write("</td>\n");
      out.write("\t\t\t<td>");
      out.print(category.getLevel() != null ? category.getLevel() : "");
      out.write("</td>\n");
      out.write("\t\t</tr>\n");
      out.write("\t\t");
	}	
      out.write("\n");
      out.write("\t\t\n");
      out.write("\t</table>\n");
      out.write("</form>\n");
      out.write("<form id=\"iBatisSqlLogForm\" name=\"iBatisSqlLogForm\" method=\"post\">\n");
      out.write("\t<input id=\"iBatisSqlLogLevel\" type=\"hidden\" name=\"level\" value=\"OFF\">\n");
      out.write("\t<input type=\"hidden\" name=\"categoryNames\" value=\"java.sql.Connection\">\n");
      out.write("\t<input type=\"hidden\" name=\"categoryNames\" value=\"java.sql.Statement\">\n");
      out.write("\t<input type=\"hidden\" name=\"categoryNames\" value=\"java.sql.PreparedStatement\">\n");
      out.write("\t<input type=\"hidden\" name=\"categoryNames\" value=\"java.sql.ResultSet\">\n");
      out.write("</form>\n");
      out.write("</body>\n");
      out.write("</html>\n");
      out.write("\n");
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
