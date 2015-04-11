/**
 * Created by narendra on 3/4/15.
 */

//TODO - Arrow key navigation !!
//TODO - Click on Progressbar must navigate to new page..

pitana.registerElement(pitana.HTMLElement.extend({
  tagName: "pt-pdfslideshow",
  template: document._currentScript.ownerDocument.querySelector("template"),
  accessors:{
    src:{
      type: "string"
    },
    currentPage: {
      type: "int",
      default: 1,
      onChange: "onPageChange"
    }
  },
  events:{
    "click #next":"onNextPage",
    "click #prev":"onPrevPage"
  },
  initialize: function () {
    pitana.HTMLElement.apply(this, arguments);
  },
  createdCallback: function () {

  },
  attachedCallback: function () {
    /*Add progressbar - Chrome bug*/
    var referenceNode = this.$.querySelector("#next");
    referenceNode.parentNode.insertBefore(document.createElement("pt-progressbar"), referenceNode.nextSibling);

    this.pdfDoc = null;

    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1;
    this.canvas = this.$.querySelector('#the-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.loadPdf();
  },
  detachedCallback: function () {
    console.log("I am ending " + this.tagName);
  },
  attributeChangedCallback: function (attrName, oldVal, newVal) {
  },
  render: function () {
    //this.$.innerHTML = '<div class="body"><canvas id="the-canvas"></canvas></div>' +
    //'<footer class="flex-container">' +
    //'<span class="btnIcon" id="prev" title="Previous"></span>' +
    //'<span class="btnIcon" id="next" title="Next"></span>' +
    //'<pt-progressbar class="flex-item"></pt-progressbar>' +
    //'<span class="status"><span id="page_num"></span> / <span id="page_count"></span></span>' +
    //'</footer>';

  },
  loadPdf: function () {
    var self = this;
    PDFJS.getDocument(this.$.src).then(function (pdfDoc) {
      self.onPdfLoaded(pdfDoc);
    });
  },
  onPdfLoaded: function (pdfDoc) {
    this.pdfDoc = pdfDoc;
    this.$.querySelector('#page_count').textContent = this.pdfDoc.numPages;

    this.$.querySelector("pt-progressbar").max = this.pdfDoc.numPages;
    this.$.currentPage = 1;
  },
  renderPage: function (num) {
    this.pageRendering = true;
    // Using promise to fetch the page
    var self = this;
    this.pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport(self.scale);
      self.canvas.height = viewport.height;
      self.canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderTask = page.render({
        canvasContext: self.ctx,
        viewport: viewport
      });

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        self.pageRendering = false;
        if (self.pageNumPending !== null) {
          // New page rendering is pending
          self.renderPage(self.pageNumPending);
          self.pageNumPending = null;
        }
      });
    });
    // Update page counters
    this.$.querySelector('#page_num').textContent = num;
  },
  onPageChange: function () {
    this.queueRenderPage(this.$.currentPage);
    ////We are trigger currentPageChange event so that outside work can get to now about current state of pdf slidesohw.
    //this.trigger("currentPageChange");
    this.$.querySelector("pt-progressbar").value = this.$.currentPage;
  },
  onNextPage: function () {
    if (this.$.currentPage >= this.pdfDoc.numPages) {
      return;
    }
    this.$.currentPage++;
  },
  onPrevPage: function () {
    if (this.$.currentPage <= 1) {
      return;
    }
    this.$.currentPage--;
  },
  queueRenderPage: function (num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }
}));