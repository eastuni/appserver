/**
 * @file     bxEncoding.js
 * @filetype js
 * @brief    encoding 변환
 * @author
 * @version  1.0
 */

(function(global) {

    global.bxEncoding = {
        'convert': function(data) {
            return convert(data);
        }
    };

    function convert(data) {
        function DataEnc(a) {
    	    this.config(a);
    	    this.intro();
    	}
    	
    	DataEnc._enctype = {
    	        u8    : ['u8', 'utf8'],
    	        // RFC-2781, Big endian should be presumed if none given
    	        u16be : ['u16', 'u16be', 'utf16', 'utf16be', 'ucs2', 'ucs2be'],
    	        u16le : ['u16le', 'utf16le', 'ucs2le']
    	};

    	DataEnc._BOM = {
    	        'none'     : '',
    	        'UTF-8'    : '%ef%bb%bf', // Discouraged
    	        'UTF-16BE' : '%fe%ff',
    	        'UTF-16LE' : '%ff%fe'
    	};

    	DataEnc.prototype = {
    	    // Basic setup
    	    config : function(a) {
    	        var opt = {
    	            charset: 'u8',
    	            mime   : 'text/csv',
    	            base64 : 0,
    	            bom    : 0
    	        };
    	        a = a || {};
    	        this.charset = typeof a.charset !== 'undefined' ?
    	                        a.charset : opt.charset;
    	        this.base64 = typeof a.base64 !== 'undefined' ? a.base64 : opt.base64;
    	        this.mime = typeof a.mime !== 'undefined' ? a.mime : opt.mime;
    	        this.bom = typeof a.bom !== 'undefined' ? a.bom : opt.bom;

    	        this.enc = this.utf8;
    	        this.buf = '';
    	        this.lead = '';
    	        return this;
    	    },
    	    // Create lead based on config
    	    // data:[<MIME-type>][;charset=<encoding>][;base64],<data>
    	    intro : function() {
    	        var
    	            g = [],
    	            c = this.charset || '',
    	            b = 'none'
    	        ;
    	        if (this.mime && this.mime !== '')
    	            g.push(this.mime);
    	        if (c !== '') {
    	            c = c.replace(/[-\s]/g, '').toLowerCase();
    	            if (DataEnc._enctype.u8.indexOf(c) > -1) {
    	                c = 'UTF-8';
    	                if (this.bom)
    	                    b = c;
    	                this.enc = this.utf8;
    	            } else if (DataEnc._enctype.u16be.indexOf(c) > -1) {
    	                c = 'UTF-16BE';
    	                if (this.bom)
    	                    b = c;
    	                this.enc = this.utf16be;
    	            } else if (DataEnc._enctype.u16le.indexOf(c) > -1) {
    	                c = 'UTF-16LE';
    	                if (this.bom)
    	                    b = c;
    	                this.enc = this.utf16le;
    	            } else {
    	                if (c === 'copy')
    	                    c = '';
    	                this.enc = this.copy;
    	            }
    	        }
    	        if (c !== '')
    	            g.push('charset=' + c);
    	        if (this.base64)
    	            g.push('base64');
    	        this.lead = 'data:' + g.join(';') + ',' + DataEnc._BOM[b];
    	        return this;
    	    },
    	    // Deliver
    	    pay : function() {
    	        return this.lead + this.buf;
    	    },
    	    // UTF-16BE
    	    utf16be : function(t) { // U+0500 => %05%00
    	        var i, c, buf = [];
    	        for (i = 0; i < t.length; ++i) {
    	            if ((c = t.charCodeAt(i)) > 0xff) {
    	                buf.push(('00' + (c >> 0x08).toString(16)).substr(-2));
    	                buf.push(('00' + (c  & 0xff).toString(16)).substr(-2));
    	            } else {
    	                buf.push('00');
    	                buf.push(('00' + (c  & 0xff).toString(16)).substr(-2));
    	            }
    	        }
    	        this.buf += '%' + buf.join('%');
    	        // Note the hex array is returned, not string with '%'
    	        // Might be useful if one want to loop over the data.
    	        return buf;
    	    },
    	    // UTF-16LE
    	    utf16le : function(t) { // U+0500 => %00%05
    	        var i, c, buf = [];
    	        for (i = 0; i < t.length; ++i) {
    	            if ((c = t.charCodeAt(i)) > 0xff) {
    	                buf.push(('00' + (c  & 0xff).toString(16)).substr(-2));
    	                buf.push(('00' + (c >> 0x08).toString(16)).substr(-2));
    	            } else {
    	                buf.push(('00' + (c  & 0xff).toString(16)).substr(-2));
    	                buf.push('00');
    	            }
    	        }
    	        this.buf += '%' + buf.join('%');
    	        // Note the hex array is returned, not string with '%'
    	        // Might be useful if one want to loop over the data.
    	        return buf;
    	    },
    	    // UTF-8
    	    utf8 : function(t) {
    	        this.buf += encodeURIComponent(t);
    	        return this;
    	    },
    	    // Direct copy
    	    copy : function(t) {
    	        this.buf += t;
    	        return this;
    	    }
    	};
    	
        // 인코딩 객체 선언(한글 처리)
        var encoder = new DataEnc({
            mime   : 'text/csv',
            charset: 'UTF-8',
            bom    : true
        });
        
        // Convert data to percent escaped text
        encoder.enc(data);
        return encoder.pay();
    }    
})(window);
