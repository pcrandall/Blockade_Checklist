    //Set timeout so visu server doesn't reject everything. 
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    //create date object array. 
    function getDaysInMonth(_month, _year) {
        let date = new Date(_year, _month, 1);
        let days = [];

        //this creates an array of date objects for all the days in a given month. 
        while (date.getMonth() === _month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    function getDays(_inputMon) {
        let URL = [];
        //just assume we only care about this year.
        let inputYear = new Date().getFullYear();
        //urlDays is an array of Date objects
        let urlDays = getDaysInMonth(_inputMon, inputYear);

        /*This iterates through each item in the array urlDays(an array of Date
        objects), gets the integer
        value for day of the week. (.getDay = 0-6), calls the function getURL with that value,
        concatenates everything and then pushes the final URL into an array of urls
        named "URL"*/

        urlDays.forEach(item => URL.push(getURL(item.getDay(), item)));
        loopURLs(URL); //Send each download request to the server
    }


    async function parsefiles() {
        //get filelist of files selected to parse from the html input.
        const rawFiles = document.getElementById("file").files;
        // create the book. 
        const book = new ExcelJS.Workbook();
        //for loop the iteration protocol way, loop through all the files in the file list. 
        for (const item of rawFiles) {
            await Papa.parse(item, {
                complete: async function (results) {
                    data = results.data;
                    //slice the array to cut off the first and last elements, we don't need them.
                    data = data.slice(2, data.length - 1);
                    const ws = book.addWorksheet()
                    ws.views = [{
                        state: 'frozen',
                        ySplit: 1,
                        activeCell: 'A1'
                    }];
                    ws.getRow(1).font = {
                        bold: true
                    };
                    ws.columns = [{
                        header: 'StartTime',
                        key: '_startTime',
                        width: 20
                    }, {
                        header: 'EndTime',
                        key: '_endTime',
                        width: 20
                    }, {
                        header: 'Text',
                        key: '_text',
                        width: 70
                    }, {
                        header: 'Duration',
                        key: '_duration',
                        width: 12
                    }];
                    //Initialize new array that will be used to remove duplicate time stamps and concat fault strings. 
                    //for loop ES6 way. 
                    var day = [];
                    data.forEach((fault, index) => {
                        day = isDuplicate(day, fault)
                    })

                    day.forEach((fault, index) => {
                        //enable multiline text in cells used for faults.
                        if (index === day.length - 1) {
                            //last line hack to get textwrap to work correctly.
                            ws.getCell('C' + (index + 1).toString()).alignment = {
                                wrapText: true
                            };
                            ws.addRow({
                                _startTime: fault[2],
                                _endTime: fault[3],
                                _text: fault[6] + " " + fault[7].trim(),
                                _duration: fault[4]
                            })
                            ws.getCell('C' + (index + 2).toString()).alignment = {
                                wrapText: true
                            };
                            ws.addRow({
                                _startTime: "",
                                _endTime: "",
                                _text: "",
                                _duration: ""
                            })
                        } else {
                            ws.getCell('C' + (index + 1).toString()).alignment = {
                                wrapText: true
                            };
                            ws.addRow({
                                _startTime: fault[2],
                                _endTime: fault[3],
                                _text: fault[6] + " " + fault[7].trim(),
                                _duration: fault[4]
                            })
                        }
                    })

                    // We're gonna give the sheets meaningful names. 
                    for (let i = 0; i < book.worksheets.length; ++i) {
                        for (let i = 0; i < book.worksheets.length; ++i) {
                            if (book.worksheets[i].getCell('B2').value != null) {
                                var d = new Date(book.worksheets[i].getCell('B2').value);
                                break;
                            }
                        }
                        // start at first date found an iterate from there.
                        const start = d.getDate();
                        d.setDate(i + start);

                        let day = d.toLocaleString('default', {
                            weekday: 'short'
                        });
                        // 08-01 instead of 2019-08-01 
                        d = d.toJSON().slice(5, 10);

                        // Mo instead of Mon to make the name fit in the tabs.
                        day = day.slice(0, 2);

                        // Mo 08-01, Tu 08-02, etc....
                        book.worksheets[i].name = day + " " + d;

                    }

                }
            })
        }
        //console.log(book);
        //Is it really a hack if it works? 
        await sleep(1000);
        //Write buffer and use the filesaver API to create a xlsx file. 
        writeBook(book);
    }

    async function writeBook(book) {
        // use fileSaver API to save file since excelJS doesn't support in browser saving.
        for (let i = 0; i < book.worksheets.length; ++i) {
            if (book.worksheets[i].getCell('B2').value != null) {
                var d = new Date(book.worksheets[i].getCell('B2').value);
                break;
            }
        }
        let m = d.toLocaleString('default', {
            month: 'long'
        });
        d = d.toJSON().slice(0, 5);

        book.xlsx.writeBuffer()
            .then(function (buffer) {
                //Check to see if there is a filename already present. If not generate one. 
                if ($("#wbName").val()) {
                    var filename = $("#wbName").val() + '.xlsx';
                } else {
                    var filename = d + m + ' Navette KPI.xlsx'
                }
                var blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                })
                saveAs(blob, filename);
            });
    }

    function isDuplicate(day, fault) {
        var found = false;

        if (day.length === 0) {
            day.push(fault);
        }

        if (day.length > 0) {

            for (let i = 0; i < day.length; i++) {

                if (day[i][6] === fault[6] &&
                    (day[i][2] <= fault[2] && (day[i][3] >= fault[2]))
                ) {

                    // Found it
                    if ((day[i][2] === fault[2] && day[i][3] <= fault[3]) ||
                        (day[i][2] <= fault[2] && day[i][3] > fault[2]) && (day[i][3] <= fault[3])
                    ) {
                        /*If start time of new fault starts while another fault is present and ends
                          after the present fault time, add the fault to the group and replace the end time.*/
                        day[i][3] = fault[3];
                        //adjust the duration of the fault, use momentjs api to make things easier.
                        var d1 = new Date(day[i][2]);
                        var d2 = new Date(fault[3]);
                        var ms = moment(d2, "DD/MM/YYYY HH:mm:ss").diff(moment(d1, "DD/MM/YYYY HH:mm:ss"));
                        var d = moment.duration(ms);
                        var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
                        day[i][4] = s;
                        //check for the string to exist in the existing fault text, only add if unique.
                        if (day[i][7].indexOf(fault[7]) === -1) {
                            day[i][7] = day[i][7].concat(',\r\n' + fault[6] + " " + fault[7].trim());
                        };
                    } else if (day[i][2] <= fault[2] && (day[i][3] >= (fault[3] || fault[2]))) {
                        //check for the string to exist in the existing fault text, only add if unique.
                        if (day[i][7].indexOf(fault[7]) === -1) {
                            day[i][7] = day[i][7].concat(',\r\n' + fault[6] + " " + fault[7].trim());
                        };
                    } else if (found === false && day[i][3] < fault[2] && day[i][3] < fault[3]) {
                        //push the new fault entry reset i and start over to verify.
                        day.push(fault);
                        i = 0;
                        found = true;
                    } else {
                        //nothing to do here.
                    }
                    found = true;
                }
                //First fault add row. ,check the indexes in day for existing timestamps,then push new fault if unique 
                if (found === false && i === day.length - 1) {
                    day.push(fault);
                }
            }
        }
        return day;
    }