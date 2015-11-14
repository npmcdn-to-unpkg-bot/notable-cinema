$(function(){

$(document).keyup( function(e){

    if ( e.which == 40 ) {
      resultNum += 1
    } else if ( e.which == 38 && resultNum > 1 ) {
      resultNum -= 1
    } else {
      resultNum = 1
    }
    $('#film-results a').removeClass('active-option')
    $('#film-results li:nth-child('+resultNum+') a').addClass('active-option')

    $('#film-results').mouseover( function(){
      $('#film-results a').removeClass('active-option')
    })

})

})
