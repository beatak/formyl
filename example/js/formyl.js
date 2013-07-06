/**
 * formyl - style your form elements right
 * 
 * @license MIT
 * @author Takashi Mizohata <beatak@gmail.com>
 * @version 0.1
 * @requires jQuery
 * @todo select-multi
 * @todo check off radio
 */

window.formyl = (function () {
  "use strict";

  /**
   * inner class that takes care of form elements behavior
   * 
   * @constructor
   */
  var Oneform = function (el, selector) {
    var $el = $(el);
    var data = $el.data();
    var tag_name = el.tagName.toLowerCase();
    var tag_type = $el.prop('type');
    var $parent;

    // console.log( 'Oneform const' );
    this.el = el;
    this.selector = JSON.parse( JSON.stringify( selector ) );
    $.each( this.selector, function (key, val) {
      if (data[key]) {
        this.selector[key] = data[key];
      }
    });

    // debugging
    $el.on('click', function(ev) {
      console.log( 'click', ev.currentTarget ); 
    });

    // EVENTS
    $el
      .on('focus', $.proxy(this.onFocus, this))
      .on('blur',  $.proxy(this.onBlur, this));
    if ('select' === tag_name) {
      // console.log( 'enhancing select' );
      $el.on('change', $.proxy( this.onSelectChange, this ) );
      this.renderSelectDisplay();
    }
    else if ('input' === tag_name && 'checkbox' === tag_type) {
      // console.log( 'enhancing checkbox' );
      $el.on('change', $.proxy( this.onCheckboxChange, this ) );
      $parent = $el.parents( this.selector.CHECKER_WRAP ).parent();
      if ( 0 === $el.parentsUntil( $parent[0], 'label' ).length ) {
        $el
          .parents( this.selector.CHECKER_WRAP )
            .find( this.selector.CHECKBOX_DISPLAY )
            .on( 'click', $.proxy( this.onCheckerDisplayClick, this ) );
      }
      this.renderCheckboxDisplay();
    }
    else if ('input' === tag_name && 'radio' === tag_type) {
      // console.log( 'enhancing radio' );
      $el.on('change', $.proxy( this.onRadioChange, this ) );
      $parent = $el.parents( this.selector.CHECKER_WRAP ).parent();
      if ( 0 === $el.parentsUntil( $parent[0], 'label' ).length ) {
        $el
          .parents( this.selector.CHECKER_WRAP )
            .find( this.selector.RADIO_DISPLAY )
            .on( 'click', $.proxy( this.onCheckerDisplayClick, this ) );
      }
      Oneform._setBrothers(this);
      Oneform._updateCheckedState(
        this.el,
        this.selector.RADIO_DISPLAY,
        $el.is(':checked')
      ); 
    }
    else {
      // console.log( 'enhancing other boxes' );
      $el.parents(this.selector.WRAPPER_BOX).on('click', $.proxy( this.onParentClick, this ) );
    }
  };

  // Event handlers
  // ==============
  Oneform.prototype.onFocus = function (ev) {
    // console.log( 'onFocus' );
    $(this.el).parents(this.selector.WRAPPER_BOX).addClass('on-focus');
  };

  Oneform.prototype.onBlur = function (ev) {
    // console.log( 'onBlur' );
    $(this.el).parents(this.selector.WRAPPER_BOX).removeClass('on-focus');
  };

  Oneform.prototype.onParentClick = function (ev) {
    // console.log( 'onParentClick' );
    if (ev.currentTarget !== ev.target) {
      return;
    }
    $(this.el).trigger( $.Event('focus', {originalEvent: ev}) );
  };

  Oneform.prototype.onSelectChange = function (ev) {
    console.log( 'onSelectChange' );
    this.renderSelectDisplay();
  };

  Oneform.prototype.onCheckboxChange = function (ev) {
    // console.log( 'onCheckboxChange' );
    this.renderCheckboxDisplay();
  };

  Oneform.prototype.onRadioChange = function (ev) {
    // console.log( 'onRadioChange' );
    this.renderRadioDisplay();
  };

  Oneform.prototype.onCheckerDisplayClick = function (ev) {
    var $el = $(this.el);
    // console.log( 'onCheckerDisplayClick' );
    $el.prop( 'checked', !$el.is(':checked') );
    $el.trigger( $.Event('change', {originalEvent: ev}) );
  };

  // Render methods
  // ==============
  Oneform.prototype.renderSelectDisplay = function () {
    var $el = $(this.el);
    $el
      .siblings( this.selector.SELECT_DISPLAY )
        .text( $el.find('option:selected').text() );
  };

  Oneform.prototype.renderCheckboxDisplay = function () {
    Oneform._updateCheckedState(
      this.el, 
      this.selector.CHECKBOX_DISPLAY, 
      $(this.el).is(':checked')
    );
  };

  /**
   * this should be only called from Oneform#onRadioChange
   * since it checkes `this.el` in the `this.brothers`
   */
  Oneform.prototype.renderRadioDisplay = function () {
    var my_el = this.el,
    RADIO_DISPLAY = this.selector.RADIO_DISPLAY;

    $.each( this.brothers, function (i, el) {
      Oneform._updateCheckedState(
        el,
        RADIO_DISPLAY,
        my_el === el
      ); 
    });
  };

  // Static method
  // =============
  /**
   * has a side effect
   * @static
   * @param {DOMNode} el
   * @param {string} selector
   * @param {boolean} toggleCondition
   */
  Oneform._updateCheckedState = function (el, selector, toggleCondition) {
    var $el = $(el);
    $el
      .parent()
      .find(selector)
        .toggleClass( 'checked', toggleCondition );
  };


  /**
   * has a side effect
   * @static
   * @param {Oneform} oneform
   */
  Oneform._setBrothers = function (oneform) {
    var nl, i;
    var $el = $(oneform.el);
    if (oneform.el.form) {
      nl = oneform.el.form[ $el.attr('name') ];
      oneform.brothers = [];
      for ( i = nl.length; i--; oneform.brothers.unshift(nl[i]) );
    }
    else {
      // YES This could lead you to the disastrous case, but because
      // you don't have a proper form set up for your radio buttons!
      oneform.brothers = $( '[name="' + $el.prop('name') + '"]' ).filter('[type="radio"]').toArray();
    }
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
      BUTTON:           base_selector + '-button',
      CHECKBOX:         base_selector + '-checkbox',
      RADIO:            base_selector + '-radio',
      SELECT:           base_selector + '-select',
      TEXT:             base_selector + '-text',
      TEXTAREA:         base_selector + '-textarea',

      // wrap for input#text, input#button, select and textarea
      WRAPPER_BOX:      base_selector + '-box',
      CHECKER_WRAP:     base_selector + '-checker-wrap', // radio and checkbox
      SELECT_WRAP:      base_selector + '-select-wrap',
      TEXTAREA_WRAP:    base_selector + '-textarea-wrap',

      // display objects 
      SELECT_DISPLAY:   base_selector + '-select-display',
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