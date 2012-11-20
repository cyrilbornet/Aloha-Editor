# Aloha Link Plugin
# * -----------------
# * This plugin provides a bubble next to a link when it is selected
#
define [
  'aloha', 
  'jquery', 
  'popover', 
  'ui/ui', 
  'aloha/console',
  'css!assorted/css/link.css'
], (
  Aloha, 
  jQuery, 
  Popover, 
  UI, 
  console
) ->

  DIALOG_HTML = '''
    <form class="modal" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
        <h3 id="linkModalLabel">Edit link</h3>
      </div>
      <div class="modal-body">
        <div id="link-text">
          <h4>Text to display</h4>
          <div>
            <input id="link-contents" class="input-xlarge" type="text" placeholder="Enter a phrase here" required />
          </div>
        </div>
        <h4 id="link-destination">Link Destination</h4>
        <div class="tabbable tabs-left"> <!-- Only required for left/right tabs -->
          <ul class="nav nav-tabs">
            <li><a href="#link-tab-external" data-toggle="tab">External</a></li>
            <li><a href="#link-tab-internal" data-toggle="tab">Internal</a></li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane" id="link-tab-external">
              <h4 for="link-external">Link to webpage</h4>
              <input class="link-input link-external" id="link-external" type="url" placeholder="http://"/>
            </div>
            <div class="tab-pane" id="link-tab-internal">
              <label for="link-internal">Link to a part in this document</label>
              <select class="link-input link-internal" id="link-internal" size="5" multiple="multiple"></select>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary link-save">Submit</button>
        <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
      </div>
    </form>'''

  showModalDialog = ($el, content) ->
      root = Aloha.activeEditable.obj
      dialog = jQuery(DIALOG_HTML)

      a = $el.get(0)
      if a.childNodes.length > 0
        # editing an existing link
        linkContents = dialog.find('#link-contents')
        linkContents.val($el.text())
      else if content
        # creating a new link
        linkContents = dialog.find('#link-contents')
        linkContents.val(content)

      # Build the link options and then populate one of them.
      linkExternal = dialog.find('.link-external')
      linkInternal = dialog.find('.link-internal')
      linkSave     = dialog.find('.link-save')

      # Combination of linkExternal and linkInternal
      linkInput    = dialog.find('.link-input')

      appendOption = (id, contentsToClone) ->
        clone = contentsToClone[0].cloneNode(true)
        contents = jQuery(clone).contents()
        option = jQuery('<option></option>')
        option.attr 'value', '#' + id
        option.append contents
        option.appendTo linkInternal

      orgElements = root.find('h1,h2,h3,h4,h5,h6')
      figuresAndTables = root.find('figure,table')
      orgElements.filter(':not([id])').each ->
        jQuery(@).attr 'id', GENTICS.Utils.guid()

      orgElements.each ->
        item = jQuery(@)
        id = item.attr('id')
        appendOption id, item

      figuresAndTables.each ->
        item = jQuery(@)
        id = item.attr('id')
        caption = item.find('caption,figcaption')
        appendOption id, caption if caption[0]

      dialog.find('a[data-toggle=tab]').on 'shown', (evt) ->
        prevTab = jQuery(jQuery(evt.relatedTarget).attr('href'))
        newTab  = jQuery(jQuery(evt.target).attr('href'))
        prevTab.find('.link-input').removeAttr('required')
        newTab.find('.link-input').attr('required', true)

      # Activate the current tab
      href = $el.attr('href')

      # Clear up the active tabs
      dialog.find('.active').removeClass('active')

      linkInputId = '#link-tab-external'
      linkInputId = '#link-tab-internal' if $el.attr('href').match(/^#/)

      #dialog.find('#link-tab-internal').tab('show')
      dialog.find(linkInputId)
      .addClass('active')
      .find('.link-input')
      .attr('required', true)
      .val(href)
      dialog.find("a[href=#{linkInputId}]").parent().addClass('active')

      dialog.on 'submit', (evt) =>
        evt.preventDefault()

        if linkContents.val() and linkContents.val().trim()
          $el.contents().remove()
          $el.append(linkContents.val())

        # Set the href based on the active tab
        active = dialog.find('.link-input[required]')
        href = active.val()
        $el.attr 'href', href
        dialog.modal('hide')

      dialog.modal('show')
      dialog.on 'hidden', () ->
        # hide all visible popovers
        $links =  Aloha.activeEditable.obj.find selector
        hidePopovers $links
        # before taking down dialog box
        dialog.remove()
      dialog

  selector = 'a'

  hidePopovers = ($a) ->
      # see popover's on hide event handler
      $a.removeData('aloha-bubble-openTimer', 0)
      $a.removeData('aloha-bubble-closeTimer', 0)
      $a.removeData('aloha-bubble-selected', false)
      $a.popover('hide')

  destroyPopovers = ($a) ->
      hidePopovers($a)
      $a.popover('destroy')
      
  unlink = ($a) ->
      a = $a.get(0)
      
      # remove the link's popover HTML et al, before unwrapping the link/anchor
      # see popover-plugin stoptOne() method:
      $links =  Aloha.activeEditable.obj.find selector
      hidePopovers $links
      destroyPopovers($a)

      # create a range based on the anchor node and select it, see GENTICS.Utils.Dom.selectDomNode
      newRange = new GENTICS.Utils.RangeObject()
      newRange.startContainer = newRange.endContainer = a.parentNode
      newRange.startOffset = GENTICS.Utils.Dom.getIndexInParent a
      newRange.endOffset = newRange.startOffset + 1
      newRange.select()

      # remove the anchor but preserve its contents aka unwrap anchor
      preserveContents = true
      GENTICS.Utils.Dom.removeFromDOM a, newRange, preserveContents
      
      # select the new, colapsed range
      newRange.startContainer = newRange.endContainer
      newRange.startOffset = newRange.endOffset
      newRange.select()
      newRange
      
  # see http://stackoverflow.com/questions/10903002/shorten-url-for-display-with-beginning-and-end-preserved-firebug-net-panel-st
  shortUrl = (url, l) ->
    l = (if typeof (l) isnt "undefined" then l else 50)
    chunk_l = (l / 2)
    url = url.replace("http://", "").replace("https://", "")
    return url  if url.length <= l
    start_chunk = shortString(url, chunk_l, false)
    end_chunk = shortString(url, chunk_l, true)
    start_chunk + ".." + end_chunk

  shortString = (s, l, reverse) ->
    stop_chars = [" ", "/", "&"]
    acceptable_shortness = l * 0.80 # When to start looking for stop characters
    reverse = (if typeof (reverse) isnt "undefined" then reverse else false)
    s = (if reverse then s.split("").reverse().join("") else s)
    short_s = ""
    i = 0

    while i < l - 1
      short_s += s[i]
      break  if i >= acceptable_shortness and stop_chars.indexOf(s[i]) >= 0
      i++
    return short_s.split("").reverse().join("")  if reverse
    short_s
    
  populator = ($el) ->
      # When a click occurs, the activeEditable is cleared so squirrel it
      editable = Aloha.activeEditable
      $bubble = jQuery('<div class="link-popover"></div>')
      
      href = $el.attr('href')
      
      # we find the images relative to where require.js lives aka Aloha.settings.baseUrl
      #     http://localhost:xxxx/aloha/src/lib
      # the below png files live here: aloha/src/plugins/oerpub/assorted/img/pencil_cnx.png
      # thus the png files relative path is:  ../plugins/oerpub/assorted/img/
      # and the absolute path is: Aloha.settings.baseUrl + /../plugins/oerpub/assorted/img/
      baseUrl = Aloha.settings.baseUrl
      details = jQuery '''
          <div class="link-popover-details">
            <a class="edit-link" >
              <img src="''' + baseUrl + '''/../plugins/oerpub/assorted/img/pencil_cnx.png" />
              <span title="Edit link">Edit link ...</span>
            </a>
            &nbsp; | &nbsp;
            <a class="delete-link">
              <img src="''' + baseUrl + '''/../plugins/oerpub/assorted/img/delete_icon.png" />
              <span title="Unlink (remove the link, leaving just the text)">Unlink</span>
            </a>
            &nbsp; | &nbsp;
            <span  class="visit-link">
              <img src="''' + baseUrl + '''/../plugins/oerpub/assorted/img/external-link-02.png" />
              <a href="''' + href + '''">''' + shortUrl(href,30) + '''</a>
            </span>
          </div>
          <br/>
      '''
      # <a href="''' + href + '''">''' + shortUrl(href,30) + '''</a>
      # <a href="''' + href + '''" title="''' + href + '''">''' + shortUrl(href,30) + '''</a>
      $bubble.append details
      $edit = details.find '.edit-link'
      $edit.on 'click', ->
          # unsquirrel the activeEditable
          Aloha.activeEditable = editable
          dialog = showModalDialog($el)

      $remove = details.find '.delete-link'
      $remove.on 'click', ->
          # unsquirrel the activeEditable
          Aloha.activeEditable = editable
          unlink($el)
      
      $bubble.contents()

  getContainerAnchor = (a) ->
    el = a
    while el
      return el  if el.nodeName.toLowerCase() is "a"
      el = el.parentNode
    false

  UI.adopt 'insertLink', null,
    click: () ->
      editable = Aloha.activeEditable
      
      # if range => selection is an anchor
      #   do not create a new link, use existing link in call to showModalDialog()
      # else
      #   create a new link
      #   extend selection to word boundaries, range.select()
      #   get text from range/selection
      #   call showModalDialog with empty link and text
      # endif
      range = Aloha.Selection.getRangeObject()
      if range.startContainer is range.endContainer 
        a = getContainerAnchor range.startContainer
        if a
          # want to prevent creating links within links so if the selection
          # contained in a link we edit that link
          $a = jQuery a
          range.startContainer = range.endContainer = a
          range.startOffset = 0
          range.endOffset = a.childNodes.length
          dialog = showModalDialog($a)
        else
          # create a new link aka insert a new link
          if range.isCollapsed()
            GENTICS.Utils.Dom.extendToWord(range)
            range.select()
          content = range.getText()
          $a = jQuery '<a href="" class="aloha-new-link"></a>'
          dialog = showModalDialog($a, content)
      else
        return

      # Wait until the dialog is closed before inserting it into the DOM
      # That way if it is cancelled nothing is inserted
      dialog.on 'hidden', =>
        Aloha.activeEditable = editable

        # link is now populated with dialog box values.
        # Case 1: link is an existing link and we are good to go
        # Case 2: link is a new link and needs to replace the selected text

        if $a.hasClass 'aloha-new-link'
          # this is a new link
        
          # If the user cancelled then don't create the link
          if not $a.attr 'href'
            return

          # Either insert a new span around the cursor and open the box 
          # or just open the box
          range = Aloha.Selection.getRangeObject()

          if range.isCollapsed()
            # insert a link with text here
            # linkText = i18n.t( 'newlink.defaulttext' )
            linkText = 'New Link'
            $a.append(linkText)
            GENTICS.Utils.Dom.insertIntoDOM $a,
              range,
              Aloha.activeEditable.obj
            range.startContainer = range.endContainer = $a.contents()[0]
            range.startOffset = 0
            range.endOffset = linkText.length
          else
            GENTICS.Utils.Dom.removeRange range
            GENTICS.Utils.Dom.insertIntoDOM $a, range, Aloha.activeEditable.obj

          # addMarkup takes a template so we need to look up the inserted object
          #   and remove the marker class
          newLink = Aloha.activeEditable.obj.find '.aloha-new-link'
          newLink.removeClass 'aloha-new-link' 
          
  Popover.register
    selector: selector
    populator: populator
