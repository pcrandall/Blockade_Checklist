window.addEventListener('load', function () {

  /** Spinner **/
  var spinner;
  var _workstart = function () {
    spinner = new Spinner().spin(_target);
  }
  var _workend = function () {
    spinner.stop();
  }

  /** filename input **/
  var _filename = function () {
    if (wbName.value != null) {
      var filename = _file.value.slice(12, _file.value.length - 5) + "_complete";
    } else {
      var filename = wbName.value + '_complete'
    }
    return filename;
  }

  /** Alerts **/
  var _badfile = function () {
    alertify.alert('This file does not appear to be a valid Excel file.  If we made a mistake, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can take a look.', function () {});
  };

  var _pending = function () {
    alertify.alert('Please wait until the current file is processed.', function () {});
  };

  var _large = function (len, cb) {
    alertify.confirm("This file is " + len + " bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?", cb);
  };

  var _failed = function (e) {
    console.log(e, e.stack);
    alertify.alert('We unfortunately dropped the ball here.  Please test the file using the <a href="/js-xlsx/">raw parser</a>.  If there are issues with the file processor, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can make things right.', function () {});
  };

  var _target = document.getElementById('drop');
  var _file = document.getElementById('file');
  var _grid = document.getElementById('grid');

  // create a new grid
  var cdg = canvasDatagrid({
    parentNode: _grid
  });

  cdg.style.height = '100%';
  cdg.style.width = '100%';

  function _resize() {
    _grid.style.height = "146px";
    _grid.style.width = "810px";
  }

  var sortedCols = {};

  /*run coordinate parser when row on sheet is clicked*/
  cdg.addEventListener('click', function (e) {
    //clear the input text for single coordinates.
    inputText.value = "";
    //columns have been rearranged check the order array.
    parseData(e.cell.data[sortedCols.STOLOC.index]);
  });

  var _onsheet = function (json) {
    //reset everything.
    resultText.value = "";
    document.getElementById("resultText").style.backgroundColor = "white";
    inputText.value = "";
    wbName.value = _filename();

    //remove the drop target when the sheet loads. 
    document.getElementById('drop').style.display = "none";

    /* show grid */
    _grid.style.display = "block";
    _resize();

    //need to check the header more thouroughly here. 
    //Check the length, make sure we have at least three columns for the sheet.
    if (json[0].length <= 2) {
      json.unshift(["STOLOC", "LU", "Verified LU"]);
    }

    /* load data */
    cdg.data = json;

    //first row is the header, save the first row for later use. 
    firstRow = json[0];

    //Rearrange the columns
    sortedCols = sortColumns(firstRow);

    while (sortedCols.STOLOC.index === null || sortedCols.verifiedLUID.index === null || sortedCols.LUID.index === null) {
      let index = 0;
      while (index < json.length) {
        json.forEach(item => {
          //console.log(sortedCols);
          let tmpCols = sortColumns(item);
          if (sortedCols.STOLOC.index === null)
            sortedCols.STOLOC.index = tmpCols.STOLOC.index;
          if (sortedCols.LUID.index === null)
            sortedCols.LUID.index = tmpCols.LUID.index;
          if (sortedCols.verifiedLUID.index === null)
            sortedCols.verifiedLUID.index = tmpCols.verifiedLUID.index;
            console.log(index);
          index++;
        });
      }
    }

    let order = [sortedCols.STOLOC.index, sortedCols.LUID.index, sortedCols.verifiedLUID.index];

    //Sort by floor number NRA3204X43200Y05Z12 where "4" is index 6
    json.forEach((loc, index) => {
      function sortThings(a, b) {
        var nav1 = a[order[0]][3] + a[order[0]][4];
        var nav2 = b[order[0]][3] + b[order[0]][4];
        //if on the same floor
        if (a[order[0]][6] == b[order[0]][6]) {
          return nav1 > nav2 ? -1 : nav2 > nav1 ? 1 : 0;
        } else {
          return a[order[0]][6] > b[order[0]][6] ? -1 : b[order[0]][6] > a[order[0]][6] ? 1 : 0;
        }
      }
      json.sort(sortThings);
    });

    //Attempt to re-arrange the columns in the correct order. We get checklists in many different formats. 
    cdg.columnOrder = order;

    //write the headers.
    firstRow.forEach((item, index) => {
      cdg.schema[index].title = item;
    });

    /*data-grid attributes*/
    cdg.attributes.columnHeaderClickBehavior = 'none';
    cdg.style.columnHeaderCellHorizontalAlignment = 'right';
    cdg.attributes.selectionMode = 'row';

   //Add empty row at the end to make inputs work correctly. 
    json.push(["","",""])

    //first row is the header now, remove it
    cdg.deleteRow(0);
  };

  //Listen for the save button to be pressed
  var sv = document.getElementById("save");
  sv.addEventListener("click", function (e) {
    cdg.insertRow(firstRow, 0);
    writeBook();
    cdg.deleteRow(0);
  });

  // Save the workbook
  function writeBook() {

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(cdg.data);

    //set the column width
    var wscols = [{
        wch: 25
      }, //chars
      {
        wpx: 125
      }, //pixels
      {
        width: 20
      } // max digit width
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws)

    var filename = wbName.value + '.xlsx';
    //Save the workbook
    XLSX.writeFile(wb, filename)
  };

  function sortColumns(r) {
    let cols = {
      STOLOC: {
        found: false,
        index: null
      },
      LUID: {
        found: false,
        index: null
      },
      verifiedLUID: {
        found: false,
        index: null
      }
    };

    r.forEach((item, index) => {
      //check to see if string exists STOLOC LUID Verified
      if (item.toLowerCase().includes("nra", "tga", "tpa", "stoloc", "loc", "sto", "location") && cols.STOLOC.found == false) {
        cols.STOLOC.index = index;
        cols.STOLOC.found = true;
      }
      //check for the LUID string to identify column
      if ((item.toLowerCase().includes("lu", "id", "luid", "tmp", "tote", "expect") && !(item.trim().toLowerCase().includes("erif"))) && cols.LUID.found == false) {
        cols.LUID.index = index;
        cols.LUID.found = true;
      }
      //check to see if verified exists within data (incomplete workbook)
      if (item.toLowerCase().includes("erif") && cols.verifiedLUID.found == false) {
        cols.verifiedLUID.index = index;
        cols.verifiedLUID.found = true;
      }
    })
    return cols;
  }

  /**Dropsheet things**/
  DropSheet({
    file: _file,
    _filename,
    drop: _target,
    on: {
      workstart: _workstart,
      workend: _workend,
      sheet: _onsheet,
      foo: 'bar'
    },
    errors: {
      badfile: _badfile,
      pending: _pending,
      failed: _failed,
      large: _large,
      foo: 'bar'
    }
  })

});