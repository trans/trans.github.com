
function show(li, id){
  $('#nav ul li').removeClass('tabOn');
  $(li).addClass('tabOn');
  $('.tab').hide();
  $(id).fadeIn();
};

