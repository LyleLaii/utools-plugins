var address = document.getElementById("address_str");

address.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        calculateWildcardMask();
    }
});


function IPv4(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;

    this.ipS = ""
    this.ipS1 = ""
    this.a2 = "";
    this.b2 = "";
    this.c2 = "";
    this.d2 = "";

    this.WcMipS = ""
    this.WcMipS1 = ""
    this.WcMa = "";
    this.WcMb = "";
    this.WcMc = "";
    this.WcMd = "";

    this.parseAddressStr = function(address_str) {
        var ips = address_str
        var ips = ips.split('.')
        this.a = ips[0]
        this.b = ips[1]
        this.c = ips[2]
        this.d = ips[3]
    };

    this.transIP = function() {
        var aa = ((parseInt(this.a)<<24)>>>0);
        var bb = ((parseInt(this.b)<<16)>>>0);
        var cc = ((parseInt(this.c)<<8)>>>0);
        var dd = (parseInt(this.d)>>>0);
        this.ipS = (aa + bb + cc + dd).toString(2).padStart(32,'0')
        this.a2 = this.ipS.substr(0, 8)
        this.b2 = this.ipS.substr(8, 8)
        this.c2 = this.ipS.substr(16, 8)
        this.d2 = this.ipS.substr(24, 8)
        this.ipS1 = this.a2 + ' ' + this.b2 + ' ' + this.c2 + ' ' + this.d2 
      };

    this.transWcM = function() {
        var aa = ((255 - parseInt(this.a)<<24)>>>0);
        var bb = ((255 - parseInt(this.b)<<16)>>>0);
        var cc = ((255 - parseInt(this.c)<<8)>>>0);
        var dd = (255 - parseInt(this.d)>>>0);
        this.WcMipS = (aa + bb + cc + dd).toString(2).padStart(32,'0')
        this.WcMa = this.WcMipS.substr(0, 8)
        this.WcMb = this.WcMipS.substr(8, 8)
        this.WcMc = this.WcMipS.substr(16, 8)
        this.WcMd = this.WcMipS.substr(24, 8)
        this.WcMipS1 = this.WcMa + ' ' + this.WcMb + ' ' + this.WcMc + ' ' + this.WcMd
      
    }

}

IPv4.transBStrToStr = function(b_str) {
    var a = parseInt(b_str.substr(0, 8), 2)
    var b = parseInt(b_str.substr(8, 8), 2)
    var c = parseInt(b_str.substr(16, 8), 2)
    var d = parseInt(b_str.substr(24, 8), 2)
    var r = a + "." + b + "." + c + "." + d
    return r

}; 

IPv4.checkMaskAddress = function(b_str, rev) {
    var end = false
    if (rev == true) {
        for (let ch of b_str) {
            if (ch == "1") {
                end = true
            }
    
            if (end == true && ch == "0") {
                return false
            }
        }
        return true 
    }
    for (let ch of b_str) {
        if (ch == "0") {
            end = true
        }

        if (end == true && ch == "1") {
            return false
        }
    }
    return true
}; 

IPv4.checkWcMCompare = function(s_str, t_str, c_str) {
    for (let i in c_str) {
        if (c_str[i] == "1") {
            continue
        }
        if (s_str[i] != t_str[i]) {
            return false
        }
    }
    return true
}; 

var ip4 = new IPv4();

function calculateWildcardMask() {
    cleatInformation("addressChecker")
    var address_str = address.value
    if (!check_ipv4_format(address_str)) {
        addInformation("addressChecker", "地址格式错误！")
        return
    }

    ip4.parseAddressStr(address_str)
    ip4.transIP()
    addInformation("binAddress", ip4.ipS1)

    ip4.transWcM()
    addInformation("WildcardMaskAddress", IPv4.transBStrToStr(ip4.WcMipS))
    addInformation("binWildcardMaskAddress", ip4.WcMipS1)

    if (!IPv4.checkMaskAddress(ip4.ipS, false)) {
        addInformation("addressChecker", "掩码出现不连续的1，请检查")
        return
    }

}

function checkResult() {
    cleatInformation("compare_result")
    var target = document.getElementById("target_address_str").value
    if (!check_ipv4_format(target)) {
        addInformation("compare_result", "源地址格式错误！")
        return
    }
    var wcm = document.getElementById("wcm_address_str").value
    if (!check_ipv4_format(wcm)) {
        addInformation("compare_result", "通配符地址格式错误！")
        return
    }

    var test = document.getElementById("test_address_str").value
    if (!check_ipv4_format(test)) {
        addInformation("compare_result", "测试地址格式错误！")
        return
    }

    var target_v4 = new IPv4();
    var wcm_v4 = new IPv4();
    var test_v4 = new IPv4();
    var result = ""

    target_v4.parseAddressStr(target)
    target_v4.transIP()

    wcm_v4.parseAddressStr(wcm)
    wcm_v4.transIP()

    test_v4.parseAddressStr(test)
    test_v4.transIP()

    result += "<code>源地址二进制:  " + target_v4.ipS1 + "</code><br>"
    result += "<code>通配符二进制:  " + wcm_v4.ipS1 + "</code><br>"
    result += "<code>测地址二进制:  " + test_v4.ipS1 + "</code><br>"

    if (IPv4.checkWcMCompare(target_v4.ipS, test_v4.ipS, wcm_v4.ipS)) {
        result += "匹配"
    } else {
        result += "不匹配"
    }

    addInformation("compare_result", result)

}

function check_ipv4_format(address_str) {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if (re.test(address_str)) {
        return true
    } else {
        return false
    }
}


function addInformation(elementId, info) {
    e = document.getElementById(elementId)
    e.innerHTML = info
}

function cleatInformation(elementId) {
    e = document.getElementById(elementId)
    e.innerHTML = ""
}

window.onload = calculateWildcardMask()