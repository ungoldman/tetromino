//= require lib/helpers
//= require lib/keymaster

$('#login-modal, #register-modal').on('shown', function(){
  var $el = $(this);
  $el.find('input:first').focus();
  key('enter',function(e){
    e.preventDefault();
    $el.submit();
  });
});
