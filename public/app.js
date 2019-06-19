$(document).on("click","#news", function() { 
$.getJSON("/all", function(data) {

    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#article").append("<p data-id='" + data[i]._id + "'>");
        $("#article").append("<p> <h4>" + data[i].title + "<h4><p>");
        $("#article").append("<p>" + data[i].link + "</p>");
      }
    });
});
$(document).on("click","p", function() {
    $("#comment").empty();

    var id = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/all/" + id
    })
    .then(function(data) {
        console.log(data);
        $("#comment").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
        $("#comment").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
        $("#comment").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
        $("#comment").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

      if(data.comment) {
          $("#titleinput").val(data.comment.title);

          $("#bodyinput").val(data.comment.body);
      }
    });
});

$(document).on("click", "#savecomment",function() {
    var id = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/all/" + id,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    })
        .then(function(data) {
            console.log(data);
            $("#comment").empty();
        });

        $("#titleinput").val("");
        $("#bodyinput").val("");
});