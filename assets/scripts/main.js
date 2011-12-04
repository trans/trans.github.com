
function show(btn, id){
  $('nav button').removeClass('tabOn');
  $(btn).addClass('tabOn');
  $('.tab').hide();
  $(id).fadeIn();
};

