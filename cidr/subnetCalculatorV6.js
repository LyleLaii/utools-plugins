var cidr = document.getElementById("cidr");
cidr.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        calculateSubnet();
    }
});

function IPv6(a, b, c, d, e, f, g, h, nmLen) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    this.g = g;
    this.h = h;
    this.nmLen = nmLen; // nmLen networmMask Lenth

    this.ipFS = ""
    this.ipCS = ""

    this.nmStr = ""; // nmStr networkMask String
    this.nmPrefix = "" // nmPrefix network prefix

    this.parseCidrStr = function(cidr_str) {
        var s = cidr_str.split('/')
        this.nmLen = s[1]

        var ipv4Inside = ""
        if (s[0].indexOf('.') != -1) {
            ipv4Inside = s[0].split(':').slice(-1)[0]
        }

        let arr =  ["0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000"]
        var ips = s[0].split('::')
        
        ips[0].split(":").forEach((element, index) => {
            if (element !== "") {
                arr[index] = element.padStart(4, '0')
            }
        });

        if (ips.length == 2) {
            es = ips[1].split(":")
            es.reverse()
            var sLen = 7
            if (ipv4Inside != "") {
                sLen = 6
            }
            es.forEach((element, index) => {
                if (element !== "") {
                    arr[sLen-index] = element.padStart(4, '0')
                }
            });
        }

        if (ipv4Inside != "") {
            ipv4InsideL = ipv4Inside.split('.')
            var a = ((parseInt(ipv4InsideL[0])<<24)>>>0);
            var b = ((parseInt(ipv4InsideL[1])<<16)>>>0);
            var c = ((parseInt(ipv4InsideL[2])<<8)>>>0);
            var d = (parseInt(ipv4InsideL[3])>>>0);
            var ipv4InsideS = (a + b + c + d).toString(2).padStart(32,'0')
            
            arr[6] = parseInt(ipv4InsideS.substr(0, 16), 2).toString(16).padStart(4, '0')
            arr[7] = parseInt(ipv4InsideS.substr(16, 16), 2).toString(16).padStart(4, '0')
        }
        
        [this.a, this.b, this.c, this.d, this.e, this.f, this.g, this.h] = arr

        this.ipFS = arr.join(":")

    };

    this.compressIPS = function() {
        var cS = []
        this.ipFS.split(":").forEach(element => {
            cS.push(element.replace(/\b(0+)/gi,""))
        })

        var tStartIndex = 0 
        var cStartIndex = 0
        var count = 0
        var maxCount = 0
        var conti = false

        cS.forEach((element, index) => {
            if (element == "") {
                if (conti) {
                    count += 1
                } else {
                    conti = true
                    count += 1
                    tStartIndex = index
                }
            } else {
                conti = false
                if (count > maxCount) {
                    maxCount = count
                    cStartIndex = tStartIndex
                }
                count = 0
            }

            if ((index == 7) && maxCount == 0 ) {
                cStartIndex = tStartIndex
                maxCount = count
            }
        })
        
        var cEndIndex = cStartIndex + maxCount - 1

        var ipCS = ""

        cS.forEach((element, index) => {
            if (index == cStartIndex) {
                if (index == 0) {
                    ipCS += ':'
                }
                if (maxCount == 1) {
                    ipCS += ':'
                }
            } else if ((index > cStartIndex) && (index < cEndIndex)) {
                ipCS += ''
            } else if (index == cEndIndex) {
                ipCS+= ':'
            } else {
                ipCS+= element
                if (index != cS.length - 1) {
                    ipCS += ':'
                }
            }


        })
        
        this.ipCS = ipCS
    };

    this.transH2B = function(h_str) {
        var r = parseInt(h_str, 16)
        return r.toString(2).padStart(16,'0')
    };

    this.transIP = function() {
        var aa = this.transH2B(this.a)
        var bb = this.transH2B(this.b)
        var cc = this.transH2B(this.c)
        var dd = this.transH2B(this.d)
        var ee = this.transH2B(this.e)
        var ff = this.transH2B(this.f)
        var gg = this.transH2B(this.g)
        var hh = this.transH2B(this.h)


        this.ipS = aa + bb + cc + dd + ee +ff + gg + hh
       };
    
    this.calcMaxSubNetCount = function() {
        var maxAvailableSubNetCount = 2 ** (64 - this.nmLen)
        return maxAvailableSubNetCount
    };

    this.calcAddress = function() {
        var np = this.ipS.substr(0, this.nmLen)
        var firstIP = np + "0".repeat(128 - this.nmLen)
        var lastIP = np + "1".repeat(128 - this.nmLen)
        setInformation("firstIP", IPv6.transBStrToStr(firstIP))
        setInformation("lastIP", IPv6.transBStrToStr(lastIP))
    }

  };

  IPv6.transBStrToStr = function(b_str) {
    var a = parseInt(b_str.substr(0, 16), 2).toString(16)
    var b = parseInt(b_str.substr(16, 16), 2).toString(16)
    var c = parseInt(b_str.substr(32, 16), 2).toString(16)
    var d = parseInt(b_str.substr(48, 16), 2).toString(16)
    var e = parseInt(b_str.substr(64, 16), 2).toString(16)
    var f = parseInt(b_str.substr(80, 16), 2).toString(16)
    var g = parseInt(b_str.substr(96, 16), 2).toString(16)
    var h = parseInt(b_str.substr(112, 16),2).toString(16)

    var r = a + ":" + b + ":" + c + ":" + d + ":" + e + ":" + f + ":" + g + ":" + h
    return r

};

var ip6 = new IPv6();

function calculateSubnet() {
    cleatInformation("cidrChecker")
    var cidr_str = cidr.value
    if (!check_ipv6_cidr_format(cidr_str)) {
        addInformation("cidrChecker", "CIDR格式错误！")
        return
    }

    ip6.parseCidrStr(cidr_str)
    if (ip6.nmLen > 64) {
        addInformation("cidrChecker", "IPV6规范网络位长度应小于64位")
        return
    }

    ip6.transIP()

    setInformation("FullIP", ip6.ipFS)

    ip6.compressIPS()
    setInformation("CompressIP", ip6.ipCS)

    setInformation("maxAvailableSubNetCount", ip6.calcMaxSubNetCount())
    // setInformation("maxAvailableHostCount", ip6.calcMaxHostCount())

    ip6.calcAddress()

}

function check_ipv6_cidr_format(cidr_str) {
    var re = /^((\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*)(\/(([1-9])|([1-9][0-9])|(1[0-1][0-9]|12[0-8]))){1})*$/
    if (re.test(cidr_str)) {
        return true
    } else {
        return false
    }
}

function compareAddress(c, a) {
    var c_a = c.ipS.substr(0, c.nmLen)
    var a_a = a.ipS.substr(0, c.nmLen)

    if (c_a == a_a) {
        return true
    } else {
        return false
    }
}

function checkResult() {
    cleatInformation("compare_result")

    var test = document.getElementById("test_address_str").value
    if (!check_ipv6_format(test)) {
        addInformation("compare_result", "测试地址格式错误！")
        return
    }

    var test_v6 = new IPv6();
    var result = ""

    test_v6.parseCidrStr(test)
    test_v6.transIP()

    if (compareAddress(ip6, test_v6)) {
        result += "测试地址属于该网段"
    } else {
        result += "测试地址不属于该网段"
    }

    addInformation("compare_result", result)
}

function check_ipv6_format(a_str) {
    var re = /^((\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*))*$/
    if (re.test(a_str)) {
        return true
    } else {
        return false
    }
} 

function setInformation(elementId, info) {
    document.getElementById(elementId).setAttribute("value", info)
}

function addInformation(elementId, info) {
    e = document.getElementById(elementId)
    e.innerHTML = info
}

function cleatInformation(elementId) {
    e = document.getElementById(elementId)
    e.innerHTML = ""
}

window.onload = calculateSubnet()