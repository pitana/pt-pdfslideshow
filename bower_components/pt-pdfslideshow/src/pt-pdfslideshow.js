/**
 * Created by narendra on 3/4/15.
 */

pitana.register({
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
    "click #prev":"onPrevPage",
    "click pt-progressbar": "onProgressBarClick",
    "keyup": "onKeyup"
  },
  onProgressBarClick: function (e) {
    var requestedPage = Math.ceil((e.clientX - this.bar.offsetLeft)/this.bar.offsetWidth*this.bar.max);
    if (requestedPage > this.bar.max || requestedPage < 1) {
      return;
    }else{
      this.$.currentPage = requestedPage;
    }
  },
  onKeyup: function (e) {
    var code = {
      RIGHT_KEY : 39,
      LEFT_KEY : 37
    };
    switch(e.keyCode){
      case code.RIGHT_KEY:
        this.onNextPage();
        break;
      case code.LEFT_KEY:
        this.onPrevPage();
        break;
    }
  },
  attachedCallback: function () {
    /*Add progressbar - Chrome bug*/
    var referenceNode = this.$.querySelector("#next");
    referenceNode.parentNode.insertBefore(document.createElement("pt-progressbar"), referenceNode.nextSibling);

    this.pdfDoc = null;
    this.pdfLoaded = false;

    this.$.setAttribute("tabindex", "-1");
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1;
    this.canvas = this.$.querySelector('#the-canvas');
    this.ctx = this.canvas.getContext('2d');
    var self = this;
    window.setTimeout(function () {
      self.loadPdf();
    }, 0);
  },
  loadPdf: function () {
    var self = this;
    this.bar = this.$.querySelector("pt-progressbar");
    this.bar.value = 0;
    this.bar.intermediate = false;
    PDFJS.getDocument(this.$.src, null, null, function(progress){
      self.onProgress(progress);
    }).then(function (pdfDoc) {
      self.onPdfLoaded(pdfDoc);
    });
  },
  onProgress: function (progress) {
    if(this.pdfLoaded === true){
      return;
    }
    if(this.bar.max !== progress.total){
      if(progress.total === null || progress.total === undefined){
        this.bar.intermediate = true
      }else{
        this.bar.max = progress.total;
      }
    }
    if(progress.loaded > this.bar.value){
      this.bar.value = progress.loaded;
    }
  },
  onPdfLoaded: function (pdfDoc) {
    this.pdfLoaded = true;
    this.pdfDoc = pdfDoc;
    this.$.querySelector('#page_count').textContent = this.pdfDoc.numPages;
    this.bar.intermediate = false;
    this.bar.max = this.pdfDoc.numPages;
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
    this.bar.value = this.$.currentPage;
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
});