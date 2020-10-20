<template>
  <div class="pdf-thumbnail" :url="url"
       v-visible:once="drawPage"
       @document-rendered="onDocumentRendered" @document-errored="onDocumentErrored">
    <!-- {{ filename }} -->
    {{ src }}
    <img
         v-if="src"
         :src="src"
         />
    <div v-else class="placeholder box-shadow">
      <div class="content">
        Loading... {{ src }}
      </div>

    </div>
  </div>
</template>

<script>
// from vue-pdfjs-demo-master
// https://github.com/rossta/vue-pdfjs-demo
// Thanks to Ross Kaffenberger

// import pdfjs from 'pdfjs-dist'
import visible from '../directives/visible';

// eslint-disable-next-line no-unused-vars
function getDocument(url) {
  // Using import statement in this way allows Webpack
  // to treat pdf.js as an async dependency so we can
  // avoid adding it to one of the main bundles
  return import(
      /* webpackChunkName: 'pdfjs-dist' */
      'pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url));
}

// eslint-disable-next-line no-unused-vars
function getDocumentOld(url) {
  // Using import statement in this way allows Webpack
  // to treat pdf.js as an async dependency so we can
  // avoid adding it to one of the main bundles


  console.log(`^^^ In getDocument function with ${url}`)

  let importPromise = import(
      /* webpackChunkName: 'pdfjs-dist' */
      'pdfjs-dist/webpack').then(pdfjs => {
        console.log(`Imported PDFjs`);
    console.log(`PDFjs workersrc = ${pdfjs.workerSrc}`);
    if (!pdfjs.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
      pdfjs.workerSrc = 'lib/pdf.worker.js';

      console.log(`PDFjs workersrc reset to = ${pdfjs.workerSrc}`);

    }
    let loadingTask = pdfjs.getDocument(url);
    console.log("Loading task:");
    console.log(loadingTask);
    loadingTask.promise.then(function(pdf) {
      console.log(`^^^ PDF loaded`);
      console.log(pdf);
      pdf.getPage(1).then(function(page) {
        console.log(`^^^ Page loaded`);
        const scale = 1.0;

        const viewport = page.getViewport({ scale: scale, });
        const canvas = document.createElement('canvas')


        const canvasContext = canvas.getContext('2d')
        const renderContext = { canvasContext, viewport };
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        let renderTask = page.render(renderContext);
        renderTask.promise
            .then(function () {
              // eslint-disable-next-line no-unused-vars
              let src = canvas.toDataURL();

              // Zeroing the width and height causes Firefox to release graphics
              // resources immediately, which can greatly reduce memory consumption.
              canvas.width = 0;
              canvas.height = 0;
            })
            .then(() => {
              console.log(`Thumbnail rendered`);
              // this.$emit('thumbnail-rendered', {
              //   page: this.page,
              //   text: `Rendered thumbnail ${this.pageNumber}`,
              });
            })
            .catch(response => {
              console.log(`^^^ Error rendering thumbnail: ${response}`)
              // this.destroyRenderTask();
              // this.$emit('thumbnail-errored', {
              //   response,
              //   page: this.page,
              //   text: `Failed to render thumbnail ${this.pageNumber}`,
              // });
            });

      })
    }).catch(e => {
      console.log("^^^ Error loading PDF:")
      console.log(e);
    });
    console.log(`Called getDocument on ${url}`);

  console.log(importPromise);
  return importPromise;

}

// pdf: instance of PDFData
// see docs for PDF.js for more info
function getPages(pdf, first, last) {
  let range = [];
  let i;
  let allPages = {};
  for (i = first; i <= last; i++) {
    range.push(i);
  }
  console.log(`In getPages, getting range ${range} with pdf loading task:`)
  console.log(pdf);

  allPages = pdf.promise.then(function(pdfDoc) {
    console.log("PDF doc loaded:");
    console.log(pdfDoc);
    allPages = range.map(number => pdfDoc.getPage(number));
    console.log("AllPages:")
    console.log(allPages);
    return allPages;
  })

  // allPages = range.map(number => pdf.getPage(number));
  // console.log(`^^^ getPages ${pdf}`)
  console.log("allPages outside of callback");
  // console.log(allPages.Promise)
  return Promise.all(allPages);
}

const BUFFER_LENGTH = 10;
const PIXEL_RATIO = window.devicePixelRatio || 1;
// const VIEWPORT_RATIO = 0.98;

function getDefaults() {
  return {
    pages: [],
    cursor: 0,
  };
}
export default {
  name: "Thumbnail",
  data () {
    return {
      src: undefined,
      thumbnail: null,
      isPageFocused: true,
      page: Object,
      pages: [],
      cursor: 0,
      pdf: undefined,
      // pageNumber: 1
    }
  },
  props: {
    filename: String,
    url: String
  },
  render(h) {
    const {canvasAttrs: attrs} = this;
    console.log("Rendering canvas");
    return h('canvas', {attrs});
  },

  directives: {
    visible
  },
  methods: {
    focusPage() {
      this.$emit('page-focus', this.pageNumber);
    },
    drawPage() {
      console.log("In drawPage");

      if (this.renderTask) return;
      const { viewport } = this;
      const canvas = document.createElement('canvas')
      const canvasContext = canvas.getContext('2d')
      const renderContext = { canvasContext, viewport };
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      this.renderTask = this.page.render(renderContext);
      this.renderTask
          .then(() => {
            this.src = canvas.toDataURL();

            // Zeroing the width and height causes Firefox to release graphics
            // resources immediately, which can greatly reduce memory consumption.
            canvas.width = 0;
            canvas.height = 0;
          })
          .then(() => {
            this.$emit('thumbnail-rendered', {
              page: this.page,
              text: `Rendered thumbnail ${this.pageNumber}`,
            });
          })
          .catch(response => {
            this.destroyRenderTask();
            this.$emit('thumbnail-errored', {
              response,
              page: this.page,
              text: `Failed to render thumbnail ${this.pageNumber}`,
            });
          });
    },

    onDocumentRendered() {
      console.log('document-errored', this.url);
    },

    onDocumentErrored(e) {
      console.log('document-errored', e);
    },

    destroyPage(_newPage, page) {
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      if (page) page._destroy();

      this.destroyRenderTask();
    },

    destroyRenderTask() {
      if (!this.renderTask) return;

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel();
      delete this.renderTask;
    },

    updateVisibility() {
      this.$parent.$emit('update-visibility');
    },
    fetchPages(currentPage = 0) {
      console.log("^^^ In fetchPages")
      if (!this.pdf) return;
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      const startIndex = this.pages.length;
      if (this.cursor > startIndex) return;

      const startPage = startIndex + 1;
      let endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount);
      if (!endPage) {
        endPage = startPage;
      }
      this.cursor = endPage;

      console.log(`Fetching pages ${startPage} to ${endPage}`);
      getPages(this.pdf, startPage, endPage)
          .then((pages) => {
            const deleteCount = 0;
            this.pages.splice(startIndex, deleteCount, ...pages);
            return this.pages;
          })
          .catch((response) => {
            this.$emit('document-errored', {text: 'Failed to retrieve pages', response});
            console.log('Failed to retrieve pages', response);
          });
    },

    onPageRendered({text, page}) {
      console.log(text, page);
    },

    onPageErrored({text, response, page}) {
      console.log('Error!', text, response, page);
    },
    created() {
      console.log("Thumbnail component created");
      this.$on('page-rendered', this.onPageRendered);
      this.$on('page-errored', this.onPageErrored);
      this.$on('pages-fetch', this.fetchPages);
    },
    render(h) {
      console.log("Thumbnail component rendering");

      return h('div', [
        this.$scopedSlots.preview({
          pages: this.pages,
        }),
        this.$scopedSlots.document({
          pages: this.pages,
        }),
      ]);
    },
  },
  watch: {
    page: 'destroyPage',
    src: 'updateVisibility',
    scale: 'updateVisibility',
    url: {
      handler(url) {
        console.log(`^^^ In url handler ${url}`)
        getDocument(url)
            .then(pdf => {
              console.log("Called getDocument, got pdf:");
              console.log(pdf);
              (this.pdf = pdf)
            })
            .catch(response => {
              this.$emit('document-errored', {text: 'Failed to retrieve PDF', response});
              console.log('Failed to retrieve PDF', response);
            });
      },
      immediate: true,
    },
    pdf(pdf, oldPdf) {
      console.log(`^^^ pdf watcher`);
      console.log(pdf);
      if (!pdf) return;
      if (oldPdf) Object.assign(this, getDefaults());

      pdf.promise.then(function (pdfDoc) {
        pdfDoc.getPage(1).then(function(page) {
          console.log(`^^^ Page loaded (pdf watcher)`);
          console.log(page);
          const scale = 1.0;

          const viewport = page.getViewport({ scale: scale, });
          const canvas = document.createElement('canvas')


          const canvasContext = canvas.getContext('2d')
          const renderContext = { canvasContext, viewport };
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          let renderTask = page.render(renderContext);
          renderTask.promise
              .then(function () {
                console.log("^^^ pdf watcher renderTask resolved:")
                // console.log(canvas.toDataURL());
                this.src = canvas.toDataURL();
                // console.log(this.src);

                // Zeroing the width and height causes Firefox to release graphics
                // resources immediately, which can greatly reduce memory consumption.
                canvas.width = 0;
                canvas.height = 0;
              })
              .then(() => {
                console.log(`Thumbnail rendered`);
                // this.$emit('thumbnail-rendered', {
                //   page: this.page,
                //   text: `Rendered thumbnail ${this.pageNumber}`,
              });
        })
            .catch(response => {
              console.log(`^^^ Error rendering thumbnail: ${response}`)
              // this.destroyRenderTask();
              // this.$emit('thumbnail-errored', {
              //   response,
              //   page: this.page,
              //   text: `Failed to render thumbnail ${this.pageNumber}`,
              // });
            });
      });


      // this.$emit('page-count', this.pageCount);
      // this.fetchPages();
    },

    pagesLength(count, oldCount) {
      if (oldCount === 0) this.$emit('pages-reset');

      // Set focusedPage after new pages are mounted
      this.$nextTick(() => {
        this.focusedPage = this.currentPage;
      });
    },

    currentPage(currentPage) {
      if (currentPage > this.pages.length) {
        this.fetchPages(currentPage);
      } else {
        this.focusedPage = currentPage;
      }
    },

  },
  computed: {
    viewport() {
      return this.page.getViewport(1.0);

    },
    pageNumber() {
      console.log(`^^^ Page ${this.page.pageNumber}, object:`);
      console.log(JSON.stringify(this.page))
      return this.page.pageNumber;
    },

    actualSizeViewport() {
      return this.viewport.clone({scale: this.scale});
    },

    canvasStyle() {
      const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
          .map(dim => Math.ceil(dim / PIXEL_RATIO));
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
    },

    canvasAttrs() {
      let {width, height} = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim));
      const style = this.canvasStyle;

      return {
        width,
        height,
        style,
        class: 'pdf-page box-shadow',
      };
    },

  },
  mounted() {
    document.body.classList.add('overflow-hidden');

    console.log(`Page ${this.pageNumber} mounted`);
  },

  beforeDestroy() {
    this.destroyPage(undefined, this.page);
  },

}

</script>

<style scoped>
.pdf-thumbnail {
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  width: 100%;
}

img,
.placeholder {
  border: 7px solid transparent;
  border-radius: 5px;
  width: 65%;
}

.pdf-thumbnail.focused img {
  border-color: rgba(68, 204, 139, 0.65);
}

.placeholder {
  background: white;
  background-clip: content-box;
  position: relative;
}

.placeholder:before {
  content: '';
  display: block;
  padding-top: 75%;
}

.placeholder .content {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.page-number {
  color: white;
  font-weight: bold;
}
</style>
