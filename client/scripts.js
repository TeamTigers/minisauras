$(function () {
    let apiURL = "https://api.github.com";
    $("main").hide();
  
    $.get(apiURL, function () {})
      .done(function (res) {
        //let mouseAllow = true;
        //window.localStorage.setItem("mouseAllow", mouseAllow);
        let districtData = res.data;
        setBtnData(res);
        defaultBtnColor();
        setMapColor(districtData);
        changeData(districtData);
        setMapData(districtData);
        setDivisionMap();
        showMapFromTable();
        $("#lastUpdate").text("Last update on : " + res.updated_on);
        $(".mainLoader").hide();
        $("main").show();
      })
      .fail(function () {
        console.log("Internal Problem here!!!");
      });
  });