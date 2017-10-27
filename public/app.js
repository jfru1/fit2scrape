$(document).on("click", "#getArticles", function() {
$("#defaultTxt").html("")

$.ajax({
  //scrape it up
    method: "GET",
    url: "/scrape/"
  })
    .done(function(data) {
      console.log(data);
$.getJSON("/articles", function(data) {
  //for each article
  for (var i = 0; i < data.length; i++) {
    //build important info on page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    var nButton = $("<button/>")
    nButton.attr("class", "saveArticle")
    nButton.attr("dataId", data[i]._id)
    nButton.text("Save Article")
    $("#articles").append(nButton)
    $("#articles").append(`<form> <input type='text' id = 'postComment' name='comment'><br> <input type='submit' value = 'Post' id ='submitComment' dataId = ${data[i]._id}  </form>`)
    var nViewPost = $("<button/>")
    nViewPost.attr("class", "viewPost")
    nViewPost.attr("dataId", data[i]._id)
    nViewPost.text("View Comments")
    $("#articles").append(nViewPost)
  }
      });
    });
  });
//save the article on click
$(document).on("click", ".saveArticle", function() {
var thisId = $(this).attr("dataId");
$.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .done(function(data) {
      console.log(data);
});
});
$(document).on("click", "#submitComment", function() {
  //pull id associated with article from submit on click
  var thisId = $(this).attr("dataId");
  console.log($("#postComment").val())
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      body: $("#postComment").val()
    }
  })
    //log the result and empty the notes field
    .done(function(data) {
      console.log(data);
      $("#notes").empty();
    });
  $("#postComment").val("");
});
$(document).on("click", ".viewPost", function() {
var thisId = $(this).attr("dataId");
$.ajax({
    method: "GET",
    url: "/articles/" + thisId
  });
    .done(function(data) {
      console.log(data)
    });
});