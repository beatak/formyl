##
# uniform replacement
#

class Oneform
  #FIXME: omg here
  selector_text: '.oneform-select-text'
  selector_wrap: '.oneform-input-wrap'
  selector_checkbox: '.oneform-checkbox'

  @.SELECTOR_CHECKBOX_DISPLAY = '.oneform-checkbox-display'
  # radio button and checkbox should have the same wrapper
  @.SELECTOR_CHCKER_WRAP = '.oneform-radio-wrap'
  @.SELECTOR_RADIO_DISPLAY = '.oneform-radio-display'

  constructor: (el) ->
    @el = el
    $el = $(el)

    data = $el.data
    if data
      @selector_text = data.textelm if data.textelm
      @selector_wrap = data.wrapelm if data.wrapelm

    $el.focus(@onFocus)
    $el.blur(@onBlur)
    if "select" is el.tagName.toLowerCase()
      @isSelect = true
      $el.change(@onSelectChange)
      @updateSelectDisplay()
    else if "input" is el.tagName.toLowerCase()
      if "checkbox" is $el.attr("type")
        $el.change(@onCheckboxChange)
        @updateCheckboxDisplay()
      else if "radio" is $el.attr("type")
        $el.change(@onRadioChange)
        $el.parents(Oneform.SELECTOR_CHCKER_WRAP).find(Oneform.SELECTOR_RADIO_DISPLAY).click(@onRadioDisplayClick)
        Oneform._updateCheckedState( el, Oneform.SELECTOR_RADIO_DISPLAY, $el.prop('checked') )
    else
      $el.parents(@selector_wrap).click(@onParentClick)

  onRadioDisplayClick: (ev) =>
    ev.preventDefault()
    $el = $(@el)
    is_checked = $el.is( ':checked' )
    $el.prop( 'checked', !is_checked )
    @onRadioChange(ev)

  onRadioChange: (ev) =>
    ev.stopPropagation()
    target = @el
    brothers = target.form[ $(target).attr('name') ]
    $.each brothers, (i, elm) ->
      Oneform._updateCheckedState( elm, Oneform.SELECTOR_RADIO_DISPLAY, target is elm )

  onParentClick: (ev) =>
    return if ev.currentTarget isnt ev.target
    e = $.Event('focus', { originalEvent: ev});
    $(@el).trigger(e)

  onSelectChange: (ev) =>
    @updateSelectDisplay()

  onFocus: (ev) =>
    $(@el).parents(@selector_wrap).addClass('on-focus')

  onBlur: (ev) =>
    $(@el).parents(@selector_wrap).removeClass('on-focus')

  onCheckboxChange: (ev) =>
    @updateCheckboxDisplay()
 
  updateSelectDisplay: ->
    $el = $(@el)
    $display = $el.siblings(@selector_text)
    text = $el.find('option:selected').text()
    $display.text( text )

  updateCheckboxDisplay: ->
    $el = $(@el)
    Oneform._updateCheckedState( @el, Oneform.SELECTOR_CHECKBOX_DISPLAY, $el.prop('checked') )

  @._updateCheckedState = (elm, selector, toggleCondition) ->
    $el = $(elm)
    $el.parent().find(selector).toggleClass('checked', toggleCondition)

$.fn.oneform = ->
  @each ->
    new Oneform @

# ##
# # FIXME: THIS NEEDS TO BE DRY, 

# class Boxless

#   selector_text: '.boxless-select-text'
#   selector_wrap: '.boxless-input-wrap'
#   selector_checkbox: '.boxless-checkbox'

#   constructor: (el) ->
#     @el = el
#     $el = $(el)

#     data = $el.data
#     if data
#       @selector_text = data.textelm if data.textelm
#       @selector_wrap = data.wrapelm if data.wrapelm

#     $el.focus(@onFocus)
#     $el.blur(@onBlur)
#     if "select" is el.tagName.toLowerCase()
#       @isSelect = true
#       $el.change(@onSelectChange)
#       @updateSelectDisplay()
#     else if "input" is el.tagName.toLowerCase() and "checkbox" is $el.attr("type")
#       $el.change(@onCheckboxChange)
#       @updateCheckboxDisplay()
#     else
#       $el.parents(@selector_wrap).click(@onParentClick)

#   onParentClick: (ev) =>
#     return if ev.currentTarget isnt ev.target
#     e = $.Event('focus', { originalEvent: ev});
#     $(@el).trigger(e)

#   onSelectChange: (ev) =>
#     @updateSelectDisplay()

#   onFocus: (ev) =>
#     $(@el).parents(@selector_wrap).addClass('on-focus')

#   onBlur: (ev) =>
#     $(@el).parents(@selector_wrap).removeClass('on-focus')

#   onCheckboxChange: (ev) =>
#     @updateCheckboxDisplay()

#   updateSelectDisplay: ->
#     $el = $(@el)
#     $display = $el.siblings(@selector_text)
#     text = $el.find('option:selected').text()
#     $display.text( text )

#   updateCheckboxDisplay: ->
#     $el = $(@el)
#     $el.parent().find('.boxless-checkbox-display').toggleClass('checked', $el.is(':checked'))

# $.fn.boxless = ->
#   @each ->
#     new Boxless @

