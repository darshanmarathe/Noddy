(function($) {
  var types = 'text search number email datetime datetime-local date '
        + 'month week time tel url color range'.split(' '),
      len = types.length;
  $.expr[':']['textall'] = function(elem) {
    var type = elem.getAttribute('type');
    for (var i = 0; i < len; i++) {
      if (type === types[i]) {
        return true;
      }
    }
    return false;
  };
})(jQuery);