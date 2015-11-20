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

    console.log('current target:', $('.active-option')[0].text)

    $('#film-results a').mouseover( function(e){
      $('#film-results a').removeClass('active-option')
      console.log('current target:', e.currentTarget.text)
      $(e.currentTarget).addClass('active-option')
    })

  })

})
