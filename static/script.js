const data = { "d_id": 1 };
const filter_preset = { "print": false, "table": [], "column": "*", "district_id": 0, "district_name": "", "plr_id": "", "plr_name": "", "start_date": "", "end_date": "", "start_time": "", "end_time": "", "min_dmg": 0, "max_dmg": 1 };
const printVal = [0, 3, 7, 8, 9, 10, 12, 13, 14, 15, 16]

$(function () {
    var all_paths = $("path");
    var show_plr = false;
    var current_district = 0;

    //populate dropdown district selection
    var district_filter = JSON.parse(JSON.stringify(filter_preset));
    district_filter["table"] = ["districts"];
    district_filter["column"] = "district_name";
    get_data_from_db(district_filter, populate_district_selection);
    change_plr_selection([[0]]);

    //wait for district selection
    $("#select_district").change(function () {
        //change plr options accordingly
        if ($("#select_district").prop("selectedIndex") == 0) {
            change_plr_selection([[0]]);
        } else {
            get_district_id($("#select_district").val(), change_plr_selection);
        }
        //change map
    });

    //wait for plr selection
    $("#select_plr").change(function () {
        //change map
    });

    //click on district
    $("path").click(function () {
        $("#reset_map").attr("disabled", false);
        var bez = $(this).attr("data-bez");
        if (!show_plr) {
            current_district = bez;

            //change element in "select_district"
            get_data_from_db(get_district_name_filter(bez),change_district_focus);

            for (var i = 0; i < all_paths.length; i++) {
                if ($(all_paths[i]).attr("data-bez") == bez) {
                    all_paths[i].style.opacity = 1;
                } else {
                    all_paths[i].style.opacity = 0.4;
                }
            }
            show_plr = true;
        } else {
            if(bez == current_district){
                //change element in "select_plr"
                $("#select_plr").val(($(this).attr("data-plr_name"))).change();
                for (var i = 0; i < all_paths.length; i++) {
                    if ($(all_paths[i]).attr("data-bez") == bez) {
                        all_paths[i].style.opacity = 0.85;
                    }
                }
                this.style.opacity = 1;
            }else{
                //change selected district and content of selects
                current_district = bez;
                get_data_from_db(get_district_name_filter(bez),change_district_focus);
                //change_plr_selection([[bez]]);
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
            if(bez == current_district){
                this.style.opacity = 0.8;
            }else{
                for (var i = 0; i < all_paths.length; i++) {
                    if ($(all_paths[i]).attr("data-bez") == bez) {
                        all_paths[i].style.opacity = 0.75;
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
            if (bez == current_district) {
                if($(this).attr("data-plr_name") == $("#select_plr").val()){
                    this.style.opacity = 1;
                }else if($("#select_plr").prop("selectedIndex") == 0){
                    this.style.opacity = 1;
                }else{
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

    //reset Button
    $("#reset_map").click(function () {
        $("#reset_map").attr("disabled", true);
        for (var i = 0; i < all_paths.length; i++) {
            all_paths[i].style.opacity = 1;
            all_paths[i].style.fill = "#556b2f";
        }
        show_plr = false;
        current_district = 0;
        $("#select_district").prop("selectedIndex", 0);
        change_plr_selection([[0]]);
    });

    //reset all filter elements
    $("#reset_button").click(function () {
        $("#select_district").prop("selectedIndex", 0);
        $("#select_plr").prop("selectedIndex", 0);
        change_plr_selection([[0]]);
        $("#set_start_date").val("");
        $("#set_end_date").val("");
        $("#set_start_time").val("");
        $("#set_end_time").val("");
        $("#set_min_damage").val("");
        $("#set_max_damage").val("");
    });

    //Apply filter and get all data
    $("#apply_filter_button").click(function () {
        get_data_from_db(get_filter_data());
    });


function show_data_in_table(data) {
    //load all elements in the table
    $("#result_table").find("tr:gt(0)").remove();
    for (var i = 0; i < data.length; i++) {
        var append_string = "<tr>"
        for (var j = 0; j < printVal.length; j++) {
            append_string += "<td>" + data[i][printVal[j]] + "</td>"
        }
        $("#result_table").append(append_string + "</tr>");
    }
}

function color_map(count){
    //check all plr_numbers and color part of map that is selected
    color_scale = ["#b2d8d8", "#66b2b2", "#008080", "#006666", "#004c4c"];
    for (var i = 0; i < all_paths.length; i++) {
        var plr_id = $(all_paths[i]).attr("id");
        for(var j = 0; j < count.length; j++){
            if(count[j][1] == plr_id){
                color_index = 0;
                if(count[j][0] > 180){
                    color_index = 4;
                }else
                if(count[j][0] > 120){
                    color_index = 3;
                }else
                if(count[j][0] > 70){
                    color_index = 2;
                }else
                if(count[j][0] > 30){
                    color_index = 1;
                }
                all_paths[i].style.fill = color_scale[color_index];
                break;
            }
        }
    }
}

function get_district_name_filter(d_id){
    var filter = JSON.parse(JSON.stringify(filter_preset));
    filter["table"] = ["districts"];
    filter["column"] = "district_name";
    filter["district_id"] = d_id;
    return filter;
}

function get_filter_data() {
    var filter = JSON.parse(JSON.stringify(filter_preset));
    filter["print"] = true;
    filter["table"] = ["districts", "plr", "fahrrad_diebstahl"]
    if ($("#select_district").prop("selectedIndex") != 0) {
        filter["district_name"] = $("#select_district").val();
    }
    if ($("#select_plr").prop("selectedIndex") != 0) {
        filter["plr_name"] = $("#select_plr").val();
    }
    filter["start_date"] = $("#set_start_date").val();
    filter["end_date"] = $("#set_end_date").val();
    filter["start_time"] = $("#set_start_time").val();
    filter["end_time"] = $("#set_end_time").val();
    filter["min_dmg"] = $("#set_min_damage").val();
    filter["max_dmg"] = $("#set_max_damage").val();
    return filter;
}

function get_district_id(d_name, callback = function () { }) {
    var filter = JSON.parse(JSON.stringify(filter_preset));
    filter["table"] = ["districts"];
    filter["column"] = "district_id";
    filter["district_name"] = d_name;
    get_data_from_db(filter, callback);
}

function change_district_focus(d_name){
    $("#select_district").val(d_name[0]).change();
}

function change_plr_selection(d_id) {
    $("#select_plr").empty();
    $("#select_plr").append("<option>---ALL---</option>");
    var filter = JSON.parse(JSON.stringify(filter_preset));
    filter["table"] = ["plr"];
    filter["column"] = "plr_name"
    filter["district_id"] = d_id[0][0];
    get_data_from_db(filter, populate_plr_selection);
}

function populate_district_selection(result) {
    for (var i = 0; i < result.length; i++) {
        $("#select_district").append($("<option></option>").val(result[i]).html(result[i]));
    }

}

function populate_plr_selection(result) {
    for (var i = 0; i < result.length; i++) {
        $("#select_plr").append($("<option></option>").val(result[i]).html(result[i]));
    }
}

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
                //show_data_in_table(result["data"]);
                color_map(result["count"]);
            } else {
                callback(result["data"]);
            }
            //data
            console.log(result["data"]);
            //data count
            console.log(result["count"]);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}
})