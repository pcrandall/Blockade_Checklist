    $(function () {
        var wk = $("#startDate").datepicker({
            showOtherMonths: true,
            selectOtherMonths: true,
            onSelect: function (dateText, inst) {
                //When we select the start date for custom export populate the filename field automatically with the week number.
                var startDate = new Date(dateText);
                var selectedYear = startDate.getFullYear();
                $("#wbName").val(selectedYear + " Week " + $.datepicker.iso8601Week(startDate));
            }
        });
    });
    $(function () {
        $("#endDate").datepicker({
            showOtherMonths: true,
            selectOtherMonths: true
        });
    });

    async function customExport() {
        let start = document.querySelector('#startDate');
        let end = document.querySelector('#endDate');
        let URL = [];
        const range = await getcustomExport(start.value, end.value);
        range.forEach(item => URL.push(getURL(item.getDay(), item)));
        loopURLs(URL); //Send each download request to the server
    }
    //create date object array. 
    function getcustomExport(_sdate, _edate) {
        let date = new Date(_sdate);
        let enddate = new Date(_edate);
        let days = [];

        //this creates an array of date objects for all the days in a given month. 
        while (date.getTime() <= enddate.getTime()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }