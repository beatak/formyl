/**
 * formyl - style your form elements
 * 
 * @license MIT
 * @author Takashi Mizohata <beatak@gmail.com>
 * @version 0.1
 * @requires jQuery
 */
window.formyl = (function () {
  "use strict";

  var Oneform = function (el, selector) {
    console.log( 'Oneform const' );
    var $el = $(el);
    var data = $el.data();
    var tag_name = el.tagName.toLowerCase();
    var tag_type = $el.prop('type');
    this.el = el;
    this.selector = JSON.parse( JSON.stringify( selector ) );
    $.each( this.selector, function (key, val) {
      if (data[key]) {
        this.selector[key] = data[key];
      }
    });

    // EVENTS
    $el
      .on('focus', $.proxy(this.onFocus, this))
      .on('blur',  $.proxy(this.onBlur, this));
    if ('select' === tag_name) {
      console.log( 'enhancing select' );
    }
    else if ('input' === tag_name && 'checkbox' === tag_type) {
      console.log( 'enhancing checkbox' );
    }
    else if ('input' === tag_name && 'radio' === tag_type) {
      console.log( 'enhancing radio' );
    }
    else {
      console.log( 'enhancing other boxes' );
      $el.parents(this.selector.WRAPPER_BOX).on('click', $.proxy( this.onParentClick, this ) );
    }
  };

  Oneform.prototype.onFocus = function (ev) {
    console.log( 'onFocus' );
    $(this.el).parents(this.selector.WRAPPER_BOX).addClass('on-focus');
  };

  Oneform.prototype.onBlur = function (ev) {
    console.log( 'onBlur' );
    $(this.el).parents(this.selector.WRAPPER_BOX).removeClass('on-focus');
  };

  Oneform.prototype.onParentClick = function (ev) {
    console.log( 'onParentClick' );
    if (ev.currentTarget !== ev.target) {
      return;
    }
    $(this.el).trigger( $.Event('focus', {originalEvent: ev}) );
  };

  // =======================================================

  var formyl = {};

  formyl.create = function (base_selector, opt) {
    var selector = generate_selector(base_selector, opt);
    $(base_selector).each( function (i, elm) {
      new Oneform(elm, selector);
    });
  };

  var generate_selector = function (base_selector, opt) {
    var result,
    default_object = {
      SELECT:           base_selector + '-select',
      CHECKBOX:         base_selector + '-checkbox',
      RADIO:            base_selector + '-radio',

      // wrap for input#text, input#button, select and textarea
      WRAPPER_BOX:      base_selector + '-box',

      // wrap for radio and checkbox
      CHECKER_WRAP:     base_selector + '-checker-wrap',

      // display objects 
      SELECT_TEXT:      base_selector + '-select-text',
      CHECKBOX_DISPLAY: base_selector + '-checkbox-display',
      RADIO_DISPLAY:    base_selector + '-radio-display'
    };
    if (undefined === opt) {
      result = default_object;
    }
    else {
      result = {};
      $.each( default_object, function (key, val) {
        result[key] = (undefined === opt[key]) ? val : opt[key];
      });
    }
    return result;
  };

  return formyl;
})();