var xValues = [0, 2880, 5760, 8640, 11520, 14400, 17280, 20160, 23040, 25920, 28800, 31680, 34560, 37440, 40320,
    43200, 46080, 48960, 51840, 54720, 57600, 60480, 63360, 66240, 69120, 72000, 74880, 77760, 80640, 83520,
    86400, 89280, 92160, 95040, 97920, 100800, 103680, 106560, 109440, 112320, 115200
];
var navettes = [1111, 1112, 1113, 1114,
    1211, 1212, 1213, 1214,
    2111, 2112, 2113, 2114,
    2211, 2212, 2213, 2214,
    3111, 3112, 3113, 3114,
    3211, 3212, 3213, 3214,
    4111, 4112, 4113, 4114,
    4211, 4212, 4213, 4214,
    5111, 5112, 5113, 5114,
    5211, 5212, 5213, 5214,
    6111, 6112, 6113, 6114,
    6211, 6212, 6213, 6214
];
var rack = [11, 12, 13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26, 27, 28
];

var height = ["01", "02", "03", "04", "05"];

var shelf = ["l01", "l02", "l03", "l04", "l05",
    "r01", "r02", "r03", "r04", "r05"
];

function parseData(e) {
    var transferPos = false;
    document.getElementById("resultText").value = "Success!";
    document.getElementById("resultText").style.backgroundColor = "lime";
    // Reset the shelf indicator. 
    document.getElementsByClassName("shelf").backgroundColor = "#7A8B99";
    for (var i = 0; i < shelf.length; i++) {
        document.getElementById(shelf[i]).style.backgroundColor = "#7A8B99";
    };
    if (!e) {
        var inputText = document.getElementById("inputText").value;
    } else {
        var inputText = e;
    }
    // Empty check
    if (inputText == "" || inputText == null) {
        document.getElementById("resultText").value = "Empty!";
        document.getElementById("resultText").style.backgroundColor = "red";
    }
    // Length check
    if (inputText.length < 14 || inputText.length > 20) {
        document.getElementById("resultText").value = "Invalid length!";
        document.getElementById("resultText").style.backgroundColor = "red";
    } else {
        // NRA check
        if (inputText[0] != "N" || inputText[1] != "R" || inputText[2] != "A") {
            document.getElementById("resultText").style.backgroundColor = "red";
            if (inputText[0] == "T" && (inputText[1] == "G" || inputText[1] == "P") && inputText[2] == "A") {
                transferPos = true;
                document.getElementById("resultText").value = "Transfer position!";
                document.getElementById("resultText").style.backgroundColor = "yellow";
            } else {
                document.getElementById("resultText").value = "Not a rack location!";
            }
        }
        var aValue = inputText.substring(inputText.lastIndexOf("A") + 1, inputText.lastIndexOf("X"));
        if ((aValue.length != 4) || (isNaN(parseInt(aValue)))) {
            document.getElementById("resultText").style.backgroundColor = "red";
            document.getElementById("resultText").value = "Invalid aisle value!";
        } else {
            var aValueArr = aValue.split("");
            aValueArr[2] = "1";
            aValue = aValueArr.join("");
            //Highlight the selected Navette
            for (var i = 0; i < navettes.length; i++) {
                if (aValue == navettes[i]) {
                    document.getElementById(aValue).style.backgroundColor = "yellow";
                } else {
                    document.getElementById(navettes[i]).style.backgroundColor = "#7A8B99";
                }
            }
            var xValue = inputText.substring(inputText.lastIndexOf("X") + 1, inputText.lastIndexOf("Y"));
            document.getElementById("xtable").innerHTML = xValue;
            if (isNaN(parseInt(xValue))) {
                document.getElementById("resultText").style.backgroundColor = "red";
                document.getElementById("resultText").value = "Invalid X: not a number!";
            } else {
                //console.log(transferPos);
                if (xValues.indexOf(parseInt(xValue)) == -1 && transferPos == false) {
                    document.getElementById("resultText").style.backgroundColor = "red";
                    document.getElementById("resultText").value = "Invalid X value!";
                } else {
                    var fValue = 0;
                    while (xValue > -1) {
                        xValue -= 2880;
                        fValue++;
                    }
                    // correction due field numbering starting with 2 not 1
                    fValue++;
                    document.getElementById("ftable").innerHTML = fValue;
                }
            }
            //Check the rack height and set the zvalue.
            var yValue = inputText.substring(inputText.lastIndexOf("Y") + 1, inputText.lastIndexOf("Z"));
            var zValue = inputText.substring(inputText.lastIndexOf("Z") + 1);
            validHeight(yValue, zValue);
            resetLocation(zValue);
            validLocation(zValue);
        }
    }

    function resetLocation(zValue) {
        for (var i = 0; i < rack.length; i++) {
            if (zValue != rack[i]) {
                document.getElementById("x" + rack[i]).style.backgroundColor = "#7A8B99";
            } else {

            };
        }

    }

    function validLocation(zValue) {
        //Check the special case with len == 1
        if (zValue.length == 1) {
            if (zValue == "1") {
                resetLocation("x11");
                document.getElementById("x11").style.backgroundColor = "yellow";
                document.getElementById("ztable").innerHTML = zValue + "1";
            } else if (zValue == "2") {
                resetLocation("x21");
                document.getElementById("x21").style.backgroundColor = "yellow";
                document.getElementById("ztable").innerHTML = zValue + "1";
            } else {
                document.getElementById("resultText").style.backgroundColor = "red";
                document.getElementById("resultText").value = "Invalid Z value!";
                document.getElementById("ztable").innerHTML = "Invalid Z value!";
            }
        }

        for (var i = 0; i < rack.length; i++) {
            if (zValue == rack[i]) {
                document.getElementById("x" + rack[i]).style.backgroundColor = "yellow";
                document.getElementById("ztable").innerHTML = zValue;
                break;
            } else {};
        }

    }

    function validHeight(yValue, zValue) {
        for (var i = 0; i < height.length; i++) {
            if (yValue == height[i]) {
                document.getElementById("ytable").innerHTML = yValue;
                if (zValue[0] == "1") {
                    document.getElementById("l" + yValue).style.backgroundColor = "yellow";
                } else if (zValue[0] == "2") {
                    document.getElementById("r" + yValue).style.backgroundColor = "yellow";
                }
                break;
            } else {}
        }
    }

}