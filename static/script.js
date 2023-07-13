const data = { "d_id": 1 };
const filter_preset = { "print": false, "table": [], "column": "*", "district_id": 0, "district_name": "", "plr_id": "", "plr_name": "", "start_date": "", "end_date": "", "min_dmg": 0, "max_dmg": 1, "bike_type": ""};
const printVal = [1, 4, 3, 8, 9, 10, 11, 12, 13]

$.fn.isValid = function(){
    return this[0].checkValidity()
};

$(function () {
    var all_paths = $("path");
    var show_plr = false;

    //populate dropdown district selection
    var district_filter = JSON.parse(JSON.stringify(filter_preset));
    district_filter["table"] = ["districts"];
    get_data_from_db(district_filter, populate_district_selection);
    change_plr_selection(0);

    //Listen for changes in district selection
    $("#select_district").change(function () {
        //change plr options accordingly
        change_plr_selection($("#select_district").val());
        //change map
        map_select_district($("#select_district").val());
    });

    //wait for plr selection
    $("#select_plr").change(function () {     
        //change map
    });

    //If a start Date gets selected
    $("#set_start_date").change(function () {
        //set min date of end date to this value
        $("#set_end_date").attr("min", $(this).val());
    });

    //If an end Date gets selected
    $("#set_end_date").change(function () {
        //set max date of start date to this value
        $("#set_start_date").attr("max", $(this).val());
    });

    //If a minimum damage value gets set
    $("#set_min_damage").change(function () {
        //check if value is valid
        if(!($("#set_min_damage").isValid())){
            $(this).val("").change();
            $(this).css("background-color", "#E30B5C");
        }else{
            $(this).css("background-color", "#fff");
        }
        //set min value of max Damage to this value
        $("#set_max_damage").attr("min", $(this).val());
    });

    //If a maximum damage value gets set
    $("#set_max_damage").change(function () {
        //check if value is valid
        if(!($("#set_max_damage").isValid())){
            $(this).val("").change();
            $(this).css("background-color", "#E30B5C");
        }else{
            $(this).css("background-color", "#fff");
        }
        //set mix value of min Damage to this value
        $("#set_min_damage").attr("max", $(this).val());
    });

    //click on district
    $("path").click(function () {
        $("#reset_map").attr("disabled", false);
        var bez = $(this).attr("data-bez");
        if (!show_plr) {
            //change element in "select_district"
            change_district_focus(parseInt(bez));
            map_select_district(parseInt(bez));
        } else {  
            if (parseInt(bez) == $("#select_district").val()) {
                //change element in "select_plr"
                $("#select_plr").val(($(this).attr("data-plr_name"))).change();
                for (var i = 0; i < all_paths.length; i++) {
                    if ($(all_paths[i]).attr("data-bez") == bez) {
                        all_paths[i].style.opacity = 0.85;
                    }
                }
                this.style.opacity = 1;
            } else {
                //change selected district
                change_district_focus(parseInt(bez));
                for (var i = 0; i < all_paths.length; i++) {
                    if ($(all_paths[i]).attr("data-bez") == bez) {
                        all_paths[i].style.opacity = 1;
                    } else {
                        all_paths[i].style.opacity = 0.4;
                    }
                }
            }
        }
    });

    //hover on district/map
    $("path").hover(function () {
        var bez = $(this).attr("data-bez");
        if (!show_plr) {
            for (var i = 0; i < all_paths.length; i++) {
                if ($(all_paths[i]).attr("data-bez") == bez) {
                    all_paths[i].style.opacity = 0.7;
                }
            }
        } else {
            if (parseInt(bez) == $("#select_district").val()) {
                if($("#select_plr").prop("selectedIndex") == 0){
                    this.style.opacity = 0.85;
                }else{
                    this.style.opacity = 0.7;
                }
            } else {
                for (var i = 0; i < all_paths.length; i++) {
                    if ($(all_paths[i]).attr("data-bez") == bez) {
                        all_paths[i].style.opacity = 0.7;
                    }
                }
            }
        }
    }, function () {
        var bez = $(this).attr("data-bez");
        if (!show_plr) {
            for (var i = 0; i < all_paths.length; i++) {
                if ($(all_paths[i]).attr("data-bez") == bez) {
                    all_paths[i].style.opacity = 1;
                }
            }
        } else {
            if (parseInt(bez) == $("#select_district").val()) {
                if ($(this).attr("data-plr_name") == $("#select_plr").val()) {
                    this.style.opacity = 1;
                } else if ($("#select_plr").prop("selectedIndex") == 0) {
                    this.style.opacity = 1;
                } else {
                    this.style.opacity = 0.85;
                }               
            } else {
                for (var i = 0; i < all_paths.length; i++) {
                    if ($(all_paths[i]).attr("data-bez") == bez) {
                        all_paths[i].style.opacity = 0.4;
                    }
                }
            }
        }
    });

    //reset-map Button
    $("#reset_map").click(function () {
        reset_map_selection();
        $("#select_district").prop("selectedIndex", 0);
        change_plr_selection(0);
    });

    //reset-filter all filter options
    $("#reset_button").click(function () {
        $("#select_district").val(0);
        $("#select_plr").val(0);
        $("#select_bike_type").val(0);
        change_plr_selection(0);
        $("#set_start_date").val("");
        $("#set_end_date").val("");
        $("#set_start_time").val("");
        $("#set_end_time").val("");
        $("#set_min_damage").val("");
        $("#set_max_damage").val("");
        reset_map_selection();
    });

    //Apply filter and get all data
    $("#apply_filter_button").click(function () {
        get_data_from_db(get_filter_data());
    });


/*
----------------
    Here start the functions called by the events
----------------
*/

    //Fill the Table with the data
    function show_data_in_table(data) {
        //delete all current entries (not the header)
        $("#result_table").find("tr:gt(0)").remove();
        //Loop through all the given data/rows/entries
        for (var i = 0; i < data.length; i++) {
            var append_string = "<tr>"
            for (var j = 0; j < printVal.length; j++) {
                append_string += "<td>" + data[i][printVal[j]] + "</td>"
            }
            $("#result_table").append(append_string + "</tr>");
        }
    }

    //Color the map after getting Count data from the server
    //Only colors the selected district. Remaining districts/plr low visibility
    function color_map(count) {
        //enable map reset button
        $("#reset_map").attr("disabled", false);
        color_scale = ["#b2d8d8", "#66b2b2", "#008080", "#006666", "#004c4c"];
        for (var i = 0; i < all_paths.length; i++) {
            var plr_id = $(all_paths[i]).attr("id");
            for (var j = 0; j < count.length; j++) {
                //If data available for the plr
                if (count[j][1] == plr_id) {
                    color_index = 0;
                    //Color steps for the map
                    if (count[j][0] > 180) {
                        color_index = 4;
                    } else
                        if (count[j][0] > 120) {
                            color_index = 3;
                        } else
                            if (count[j][0] > 70) {
                                color_index = 2;
                            } else
                                if (count[j][0] > 30) {
                                    color_index = 1;
                                }
                    all_paths[i].style.fill = color_scale[color_index];
                    all_paths[i].style.opacity = 1;
                    break;
                }else{
                    //!!!!!!!!!!!!!!!!!!!!TODO!!!!!!!!!
                    //No data for these plr -> low visibility
                    all_paths[i].style.fill = "#000";
                    all_paths[i].style.opacity = 0.4;
                }
            }
        }
    }

    //get filter for updating map (read all inputs and return a filter)
    function get_filter_data() {
        var filter = JSON.parse(JSON.stringify(filter_preset));
        filter["print"] = true;
        filter["table"] = ["districts", "planningareas", "bicyclethefts"]
        if ($("#select_district").val() != 0) {
            filter["district_id"] = $("#select_district").val();
        }
        if ($("#select_plr").val() != 0) {
            filter["plr_name"] = $("#select_plr").val();
        }
        if ($("#select_bike_type").val() != 0){
            filter["bike_type"] = $("#select_bike_type").val();
        }
        filter["start_date"] = $("#set_start_date").val();
        filter["end_date"] = $("#set_end_date").val();
        filter["min_dmg"] = $("#set_min_damage").val();
        filter["max_dmg"] = $("#set_max_damage").val();
        filter["count_bike_thefts"] = true; //Added for count
        return filter;
    }

    //Change colored section on map
    function map_select_district(d_id){
        if(d_id == 0){
            reset_map_selection();
            return;
        }
        for (var i = 0; i < all_paths.length; i++) {
            if (parseInt($(all_paths[i]).attr("data-bez")) == d_id) {
                all_paths[i].style.opacity = 1;
            } else {
                all_paths[i].style.opacity = 0.4;
            }
        }
        show_plr = true;
    }

    //Necessary if i use callback functions. Change the selected district in select
    function change_district_focus(d_id){
        $("#select_district").val(d_id).change();
        //show selection in map!!!!!!!!!!!!!!!!!!!!
    }

    //Reset the selection on the map
    function reset_map_selection(){
        $("#reset_map").attr("disabled", true);
        for (var i = 0; i < all_paths.length; i++) {
            all_paths[i].style.opacity = 1;
            all_paths[i].style.fill = "#000";
        }
        show_plr = false;
    }

    function display_bike_theft_count(count) {
        document.getElementById('bike-theft-count').textContent = 'Count of bike thefts: ' + count;
    }

    //Get the valuesfor the plr select accoring to set district
    function change_plr_selection(d_id) {
        $("#select_plr").empty();
        $("#select_plr").append($("<option></option>").val(0).html("---ALL---"));
        var filter = JSON.parse(JSON.stringify(filter_preset));
        filter["table"] = ["planningareas"];
        filter["column"] = "plr_name"
        filter["district_id"] = d_id;
        get_data_from_db(filter, populate_plr_selection);
    }

    //Only called at beginning to set the options for the district selection
    function populate_district_selection(result) {
        for (var i = 0; i < result.length; i++) {
            $("#select_district").append($("<option></option>").val(result[i][0]).html(result[i][1]));
        }
    }

    //Populate the select options
    //Only possible pl-regionen selectable
    function populate_plr_selection(result) {
        for (var i = 0; i < result.length; i++) {
            $("#select_plr").append($("<option></option>").val(result[i]).html(result[i]));
        }
    }


    //get the data from server - Send json -> get json back with db-data
    //given callback function handels the data depending on the request/call
    function get_data_from_db(filter, callback = function () { }) {
        fetch("/get-client-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filter)
        })
            .then(response => response.json())
            .then(result => {
                if (filter["print"]) {
                    show_data_in_table(result["data"]);
                    color_map(result["count"]);
                    display_bike_theft_count(result["bike_theft_count"]);
                } else {
                    callback(result["data"]);
                }
                //data
                console.log(result["data"]);
                //data count
                console.log(result["count"]);
                //bike theft count
                console.log(result["bike_theft_count"]);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
})
